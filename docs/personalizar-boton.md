¿Cómo integrar un Botón de pagos Bold personalizado?
En ocasiones, incluir el botón de pagos con el diseño de Bold puede no ser la solución ideal para ti.

Si quieres conservar la estética de tu sitio web y preservar con ello la identidad de tu marca, puedes optar por hacer una integración personalizada como se detalla a continuación.

success
Este tipo de integración permite asignar la funcionalidad del Botón de pagos Bold a cualquier elemento dentro de tu sitio web, es decir, si ya tienes un botón para hacer pagos, puedes hacer que este abra la pasarela de pagos de Bold.

También puede servirte si estás haciendo una integración personalizada con carrito de compras. Con este tipo de integración, tienes flexibilidad para abrir la pasarela de pagos Bold cuando lo requieras en respuesta a eventos.

info
Para hacer este tipo de implementación se requieren algunos conocimientos técnicos básicos al igual que para hacer una integración del botón de pagos sin plugins.

El proceso puede resumirse en 3 pasos:
1 . Inicializar el script de Bold
Al igual que para la integración de un botón de pagos con el diseño de Bold, en este caso también debes incluir en el head de tu sitio web el script que incluye la lógica para la integración. Para ello tienes dos opciones:

Incluir en el head de manera permanente el script de nuestro boton:

<script src="https://checkout.bold.co/library/boldPaymentButton.js"></script>
Inicializar el script sólo en el momento que lo necesites. Para ello puedes usar la siguiente función:

    const initBoldCheckout = () => {
        if (document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
            console.warn('Bold Checkout script is already loaded.');
        return;
    }
 
        var js;
        js = document.createElement('script');
        js.onload = () => {
            window.dispatchEvent(new Event('boldCheckoutLoaded'));
        };
        js.onerror = () => {
            window.dispatchEvent(new Event('boldCheckoutLoadFailed'));
        };
        js.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
        document.head.appendChild(js);
    };
La tarea principal de esta función es añadir el script al head y ejecutarlo.

info
Además, se disparará uno de los siguientes eventos personalizados en el objeto global window:

boldCheckoutLoaded → cuando el script haya cargado y se haya ejecutado correctamente

boldCheckoutLoadFailed → si la carga del script falla por algún motivo (p.ej. por un error en la conexión)

Puedes usar estos eventos personalizados para ejecutar la lógica que necesites en cada escenario.

2. Crear instancia de una venta
Una vez se haya cargado correctamente el script, en el objeto global window estará disponible el constructor de instancias de ventas con el nombre BoldCheckout.

El constructor recibe como único parámetro un objeto con la configuración de la venta. Las propiedades de este objeto se corresponden con los datos de la venta obligatorios y opcionales que se detallan en la documentación de integración de un botón de pagos, en este caso sin embargo se usa la sintaxis camelCase para cada uno de los datos como se muestra a continuación en el ejemplo:


const oderId = "MY-ORDER789-"+Date.now() * 1e6;
const checkout = new BoldCheckout({
    orderId: oderId,
    currency: "COP",
    amount: "10000",
    apiKey: "LLAVE_DE_IDENTIDAD",
    integritySignature: "HASH_DE_INTEGRIDAD",
    description: "Camiseta Rolling Stones XL",
    tax: "consumption",
    originUrl: "https://micomercio.com/pagos/abandono/promo",
    redirectionUrl: "https://micomercio.com/pagos/resultado",
    expirationDate: 1798598454489,
    renderMode: 'embedded',
    customerData: JSON.stringify({
        email: 'ejemplo@misitio.com',
        fullName: 'Lola Flores',
        phone: '3040777777',
        dialCode: '+57',
        documentNumber: '123456789',
        documentType: 'CC'
    }),
    billingAddress: JSON.stringify({
        address: "Calle 123 # 4-5",
        zipCode: "123456",
        city: "Bogota",
        state: "Cundinamarca",
        country: "CO"
    }),
    extraData1: 'informacion extra 1',
    extraData2: 'informacion extra 2'
});
Recuerda que HASH_DE_INTEGRIDAD se genera por seguridad y puedes ver los detalles de como hacerlo aquí

success
Puedes crear tantas instancias de venta como quieras.

Si p.ej. quieres crear 3 botones de pago, cada uno puede tener su propia configuración (su propio monto, descripción, identificador de la orden, etc).

info
La carga del script es síncrona pero prácticamente instantánea. El constructor BoldCheckout estará disponible tan pronto como el script sea procesado por el navegador, no es necesario que el DOM haya cargado para usarlo.

Aunque no es necesario, si quieres que el script cargue de manera asíncrona solo debes añadirle el atributo async para que cargue en paralelo con el resto de la página sin ser bloqueante. Otra opción es moverlo al final del body.

3. Asignar funcionalidad de botón de pagos al elemento deseado
Una vez configurada la instancia sólo queda hacer que el elemento deseado de tu sitio web se comporte como un botón de pagos.

Para ello, debes llamar al método open de la instancia que hemos creado previamente cuando se haga clic en el elemento. A continuación, un ejemplo.

Imaginemos que tienes el siguiente botón en tu web con tus propios estilos:

<button id="custom-button" id="custom-button-payment">Pagar ahora</button>
Al hacer clic sobre el mismo se llama al método open y esto abre la pasarela de pagos de Bold:

const customButton = document.getElementById('custom-button-payment');
customButton.addEventListener('click', () => {
  checkout.open();
});
success
Puedes abrir la pasarela de pagos de Bold en cualquier momento llamando al método open. Puedes hacerlo directamente o usando un evento(hacer clic en un botón es lo más común, pero podrías usar cualquier tipo de evento que requieras).

Métodos
Cada instancia creada con el constructor BoldCheckout dispone de los siguientes métodos:

open
Abre la pasarela de pagos de Bold.

Ejemplo de uso:

/*
 * Abre la Pasarela de pagos de Bold con la configuración indicada al crear la instancia
 * redirigiendo al usuario a la pasarela o en un modal con la opción Embedded Checkout.
 */
checkout.open();


getConfig(key)
Permite obtener el valor de la propiedad indicada desde la configuración de la instancia.

Parámetros:

key (string) — El nombre de la propiedad.
Cualquier propiedad del objeto de configuración con el que se creó la instancia puede ser accedida.

Ejemplo de uso:

/*
 * Retorna el valor de la venta configurado para la instancia checkout.
 */
checkout.getConfig('amount');


updateConfig(key, value)
Permite actualizar el valor de la propiedad indicada sobre la configuración de la instancia.

Ejemplo de uso:

key (string) — El nombre de la propiedad.
Cualquier propiedad del objeto de configuración con el que se creó la instancia puede ser actualizada.

value (string) — El valor de la propiedad.
Por simplicidad siempre será un string, incluso para valores numéricos.

Ejemplo de uso:

/*
 * Establece en “2000” el valor de la venta configurado para la instancia checkout.
 */
checkout.updateConfig('amount', '2000');
