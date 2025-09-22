import { supabase } from './modules/supabaseClient.js';

// -----------------------------------------------------------------------------
// --- 1. DECLARACIÓN DE VARIABLES Y ELEMENTOS DEL DOM ---
// -----------------------------------------------------------------------------

// Almacenará la lista completa de productos para poder filtrar sobre ella.
let allProducts = [];
let filteredProducts = []; // Productos después de aplicar filtros
let currentPage = 1;
const itemsPerPage = 15;

// Elementos del DOM que usaremos repetidamente.
const productListContainer = document.getElementById('product-list-container');
const searchBar = document.getElementById('search-bar');
const addProductForm = document.getElementById('add-product-form');
const logoutButton = document.getElementById('logout-button');
const listMessage = document.getElementById('list-message');
const addMessage = document.getElementById('add-message');

// -----------------------------------------------------------------------------
// --- 2. LÓGICA PRINCIPAL Y VERIFICACIÓN DE SESIÓN ---
// -----------------------------------------------------------------------------

// Este evento se dispara cuando el HTML ha sido completamente cargado.
document.addEventListener('DOMContentLoaded', async () => {
  // Verificamos si hay una sesión de usuario activa.
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Si no hay sesión, el usuario no está autenticado.
    // Lo redirigimos a la página de inicio de sesión.
    window.location.href = 'login.html';
  } else {
    // Si hay una sesión, el usuario está autenticado.
    console.log('✅ Usuario autenticado:', session.user.email);
    // Procedemos a cargar y mostrar los productos del inventario.
    await fetchAndDisplayProducts();
  }
});

// -----------------------------------------------------------------------------
// --- 3. FUNCIONES CRUD (CREATE, READ, UPDATE, DELETE) ---
// -----------------------------------------------------------------------------

/**
 * Carga todos los productos desde la base de datos de Supabase.
 */
const fetchAndDisplayProducts = async () => {
  listMessage.textContent = 'Cargando inventario... 🥖';

  // Hacemos la petición a la tabla 'products' de Supabase.
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }); // Ordena para ver los más nuevos primero.

  if (error) {
    console.error('Error al cargar los productos:', error);
    listMessage.textContent = '❌ Error al cargar el inventario.';
    return;
  }

  // Guardamos la lista completa en nuestra variable global.
  allProducts = data;
  filteredProducts = data; // Inicialmente, los productos filtrados son todos
  currentPage = 1; // Reiniciamos a la primera página
  // Renderizamos los productos con paginación.
  renderProductsWithPagination();
  listMessage.textContent = ''; // Limpiamos el mensaje de carga.
};

/**
 * Renderiza los productos de la página actual con controles de paginación.
 */
const renderProductsWithPagination = () => {
  // Calculamos los índices para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);
  
  // Renderizamos los productos de la página actual
  renderProducts(productsToShow);
  
  // Renderizamos los controles de paginación
  renderPaginationControls();
};

/**
 * Renderiza una lista de productos en el contenedor del HTML.
 * @param {Array} products - El array de productos a mostrar.
 */
const renderProducts = (products) => {
  // Limpiamos el contenido actual del contenedor.
  productListContainer.innerHTML = '';

  if (products.length === 0 && filteredProducts.length === 0) {
    productListContainer.innerHTML = '<p>No hay productos en el inventario. ¡Agrega uno!</p>';
    return;
  }

  if (products.length === 0 && filteredProducts.length > 0) {
    productListContainer.innerHTML = '<p>No se encontraron productos en esta página.</p>';
    return;
  }

  // Creamos y añadimos un elemento HTML por cada producto.
  products.forEach(product => {
    const productElement = document.createElement('div');
    productElement.className = 'item-card'; // Clase para darle estilos CSS.
    productElement.innerHTML = `
      <h3>${product.name}</h3>
      <p><strong>Categoría:</strong> ${product.category || 'N/A'}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <button class="delete-button" data-id="${product.id}">Eliminar</button>
    `;
    productListContainer.appendChild(productElement);
  });
};

/**
 * Renderiza los controles de paginación.
 */
const renderPaginationControls = () => {
  // Calculamos el número total de páginas
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Si solo hay una página o menos, no mostramos controles
  if (totalPages <= 1) {
    return;
  }

  // Creamos el contenedor de paginación
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container';
  paginationContainer.innerHTML = `
    <div class="pagination-info">
      Página ${currentPage} de ${totalPages} (${filteredProducts.length} productos total)
    </div>
    <div class="pagination-buttons">
      <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
      <span class="page-numbers"></span>
      <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente →</button>
    </div>
  `;

  // Añadimos los números de página
  const pageNumbersContainer = paginationContainer.querySelector('.page-numbers');
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'page-number active' : 'page-number';
    pageButton.addEventListener('click', () => {
      currentPage = i;
      renderProductsWithPagination();
    });
    pageNumbersContainer.appendChild(pageButton);
  }

  // Añadimos el contenedor al DOM
  productListContainer.appendChild(paginationContainer);

  // Añadimos eventos a los botones de anterior y siguiente
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderProductsWithPagination();
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProductsWithPagination();
    }
  });
};

// -----------------------------------------------------------------------------
// --- 4. MANEJADORES DE EVENTOS (EVENT LISTENERS) ---
// -----------------------------------------------------------------------------

// Evento para el formulario de agregar un nuevo producto.
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evitamos que la página se recargue.

  // Obtenemos los valores de los campos del formulario.
  const productName = document.getElementById('product-name').value;
  const productCategory = document.getElementById('product-category').value;
  const productStock = document.getElementById('product-stock').value;

  // Insertamos el nuevo producto en la base de datos.
  const { error } = await supabase
    .from('products')
    .insert([{
        name: productName,
        category: productCategory,
        stock: parseInt(productStock, 10) // Convertimos el stock a número.
    }]);

  if (error) {
    console.error('Error al agregar el producto:', error);
    addMessage.textContent = '❌ Error al agregar el producto.';
  } else {
    addMessage.textContent = '✅ ¡Producto agregado con éxito!';
    addProductForm.reset(); // Limpiamos los campos del formulario.
    await fetchAndDisplayProducts(); // Recargamos la lista para ver el nuevo producto.
    
    // Ocultamos el mensaje de éxito después de 2 segundos.
    setTimeout(() => {
      addMessage.textContent = '';
    }, 2000);
  }
});

// Evento para la barra de búsqueda (se activa con cada tecla presionada).
searchBar.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  // Filtramos la lista `allProducts` basándonos en el término de búsqueda.
  filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm)
  );
  
  // Reiniciamos a la primera página cuando se hace una nueva búsqueda
  currentPage = 1;
  
  // Renderizamos los productos filtrados con paginación.
  renderProductsWithPagination();
});

// Evento para eliminar un producto (usando delegación de eventos).
productListContainer.addEventListener('click', async (e) => {
  // Nos aseguramos de que el clic fue en un botón de eliminar.
  if (e.target && e.target.classList.contains('delete-button')) {
    const productId = e.target.getAttribute('data-id');
    const confirmed = confirm('¿Estás seguro de que quieres eliminar este producto?');

    if (confirmed) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error al eliminar:', error);
        alert('No se pudo eliminar el producto.');
      } else {
        await fetchAndDisplayProducts(); // Recargamos la lista actualizada.
      }
    }
  }
});

// Evento para el botón de cerrar sesión.
logoutButton.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error);
  }
  // No es necesario un `else`, ya que el estado de la sesión cambiará
  // y la próxima vez que se intente acceder a esta página, será redirigido.
  // Pero lo redirigimos manualmente para una mejor experiencia de usuario.
  window.location.href = 'login.html';
});