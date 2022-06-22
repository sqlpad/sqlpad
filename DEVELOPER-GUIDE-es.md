# Guía para desarrolladores

## Prerrequisitos

*   [Nodo](https://nodejs.org) instalado en v14.0.0+
*   [Hilo 1 (hilo clásico)](https://classic.yarnpkg.com/lang/en/)
*   Algunas dependencias pueden requerir compilación. En macOS, las herramientas de línea de comandos de Xcode deben estar instaladas. En Ubuntu, `apt-get install build-essential` instalará los paquetes necesarios. Comandos similares deberían funcionar en otras distribuciones de Linux. Windows requerirá algunos pasos adicionales, consulte el [`node-gyp` instrucciones de instalación](https://github.com/nodejs/node-gyp#installation) para más detalles.

## Guía de estilo

SQLPad utiliza un formateador de código automático llamado [Bonita](https://prettier.io/) y una herramienta de pelusa llamada ESLint.
Correr `yarn run lint` después de realizar cualquier cambio en el código para comprobar el formato y la pelusa. Algunos formatos y pelusas se pueden arreglar automáticamente ejecutando `yarn run fixlint`.

Si utiliza Visual Studio Code, se pueden instalar extensiones Prettier y ESLint para ayudar a detectar y solucionar problemas durante el desarrollo.

## Empezar

*   Clonar/descargar este repositorio
*   Instalar dependencias y crear la interfaz de usuario

    ```sh
    scripts/build.sh
    ```

    La esencia de este guión es:

    ```sh
    # install root level dependencies using package-lock.json as reference
    yarn
    # install front-end dependencies using package-lock.json
    cd client
    yarn
    # build front-end
    yarn build
    # install back-end dependencies
    cd ../server
    yarn
    cd ..
    # copy client build to server directory
    mkdir server/public
    cp -r client/build/* server/public
    ```

En este punto, puede ejecutar el servidor SQLPad con el front-end creado para uso de producción:

```sh
cd server
node server.js --config ./config.dev.env
```

Si se prefiere, SQLPad se puede instalar como un módulo global utilizando los archivos locales de este repositorio. Esto permite ejecutar SQLPad a través de la cli en cualquier directorio, como si lo hubiera instalado con `npm install sqlpad -g`. Tenga en cuenta que debe compilar y copiar el cliente antes de este paso.

```sh
cd server
npm install -g

# Now from somewhere else you can run sqlpad like
cd ~
sqlpad --config ./config.dev.env
```

Si sqlpad se instaló globalmente a través de npm desde npm, es posible que deba ejecutar `npm uninstall sqlpad -g`.

Se puede crear una imagen de Docker utilizando el Dockerfile ubicado en `server` directorio. Ver `docker-publish.sh` por ejemplo, el comando docker build.

## Desarrollo

Abra 2 sesiones de terminal en la raíz de este repositorio.

En una sesión, ejecute el back-end en modo de desarrollo

```sh
cd server
yarn start
```

En el otro, inicie el servidor de desarrollo para el front-end.

```sh
cd client
yarn start
```

En este punto, debe tener servidores de desarrollo back-end y front-end en ejecución.

http://localhost:3000 sirve frontend basado en React en modo de desarrollo\
http://localhost:3010 sirve frontend compilado para producción

Al ver el front-end en modo de desarrollo, la página se actualizará automáticamente en los cambios de archivo de cliente. El servidor back-end también se reiniciará automáticamente en los cambios de archivos back-end.

Al ver SQLPad en modo de desarrollo en el puerto 3000, es posible que algunas funciones no funcionen correctamente (como las descargas csv/xlsx, la autenticación de Google). Esto probablemente se deba a la diferencia de puerto en la configuración (la autenticación de Google solo puede redirigir a 1 url / puerto) o la configuración de proxy en modo de desarrollo (el modo de desarrollo react es servido por un servidor web secundario que enviará solicitudes de proxy que no entiende al servidor SQLPad que se ejecuta en 3010 durante el desarrollo).

ESLint y Prettier se utilizan para aplicar patrones de código y formato en este proyecto. Un gancho de compromiso previo debe hacer cumplir y advertir sobre estas comprobaciones. Sin embargo, si no está configurado, puede encontrar útiles estos comandos de terminal.

```sh
# To check lint
yarn run lint

# To fix (some) errors and formatting automatically
yarn run fixlint
```

## Desarrollo en Windows

Correr `build/scripts.sh` En Windows, es posible que desee utilizar una aplicación como [cmder](https://cmder.net/). Te permitirá correr `scripts/build.sh` llamando `sh` directamente con `sh scripts/build.sh`.

## Conexión de base de datos de prueba/desarrollo

Un script .js Node, `server/generate-test-db-fixture.js`, se puede utilizar para generar una base de datos sqlite de prueba que se utilizará para pruebas y desarrollo local. Esto reemplaza la implementación anterior del controlador simulado que se habilitó cuando el `debug` la bandera estaba encendida.

Esta base de datos de prueba permite ejecutar SQL que probablemente conozca, en lugar de tener que recordar y usar algunas variables establecidas en los comentarios sql.

El script agrega una base de datos sqlite en `server/test/fixtures/sales.sqlite`.

Se puede usar dentro de SQLPad creando una conexión utilizando el controlador SQLite y estableciendo el nombre de archivo en `./test/fixtures/sales.sqlite`.

Los datos en la base de datos son algo absurdos. Tampoco está aleatorizado para que los resultados puedan ser predecibles. Si desea ampliar esta base de datos, siéntase libre.

## Ejecución de pruebas

Los casos de prueba de SQLPad se centran en el servidor API, y la mayoría de las pruebas son pruebas de integración, con algunas pruebas unitarias esparcidas por todas partes.

Las pruebas se encuentran en `server/test` directorio y uso `mocha` como corredor de pruebas. Las pruebas se pueden ejecutar ejecutando `yarn test` dentro del directorio del servidor. Para que las pruebas se ejecuten correctamente, se deben instalar dependencias y generar el elemento de base de datos de prueba.

```sh
cd server
# if dependencies have not yet been installed (build.sh will do this)
yarn

# If test fixture has not yet been generated (build.sh will do this)
node generate-test-db-fixture.js

# Start backend services if desired. (-d runs in background)
docker-compose up -d redis
docker-compose up -d ldap

# Run tests
yarn test

# If you are aiming to run a specific test case,
# you may do so using npx to call mocha,
# specifying the path to the test file and --exit to exit after tests have run
npx mocha test/path/to/file.js --exit
```

## Libera

SQLPad intenta seguir [control de versiones semántico](https://semver.org/). Como aplicación, esto significa principalmente romper los cambios de la API HTTP, romper los cambios de configuración o los principales cambios en el diseño de la interfaz de usuario dará como resultado un aumento importante de la versión. Los baches menores y de la versión del parche consistirán en mejoras y correcciones.

Para todas las mejoras, la funcionalidad principal de SQLPad no debe modificarse de ninguna manera importante a menos que esté planificada para una próxima versión principal.

El medio principal de distribución de SQLPad es a través de imágenes de Docker Hub. Las imágenes se crean automáticamente a partir de etiquetas git enviadas al repositorio que coinciden con el formato de versión `v<major>.<minor>.<patch>`.

Para simplificar la creación de bumps de versión de package.json y la creación de etiquetas, el `scripts/version.sh` se puede utilizar para cortar una nueva versión. Realizar actualizaciones para `CHANGELOG.md` seguido de la ejecución `scripts/versions.sh 3.4.5` (o cualquiera que sea el número de versión).
