# SQLPad

Una aplicación web para escribir y ejecutar consultas SQL y visualizar los resultados. Soporta Postgres, MySQL, SQL Server, ClickHouse, Crate, Vertica, Trino, Presto, SAP HANA, Cassandra, Snowflake, Google BigQuery, SQLite, TiDB y muchos más vía [ODBC](https://github.com/sqlpad/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://user-images.githubusercontent.com/303966/99915755-32f78e80-2ccb-11eb-9f74-b18846d6108d.png)

## Imagen de Docker

La imagen de Docker se ejecuta en el puerto 3000 y utiliza `/var/lib/sqlpad` para el directorio de base de datos incrustado.

`latest` la etiqueta se construye continuamente a partir de la última confirmación en repositorio. Solo use eso si desea vivir en el borde, de lo contrario use etiquetas de versión específicas para garantizar la estabilidad.

Ver [docker-ejemplos](https://github.com/sqlpad/sqlpad/tree/master/docker-examples) directorio, por ejemplo, docker-compose setup con SQL Server.

## Desarrollo

Para obtener instrucciones sobre cómo instalar/ejecutar SQLPad desde git repo, consulte [DEVELOPER-GUIDE.md](https://github.com/sqlpad/sqlpad/blob/master/DEVELOPER-GUIDE.md)

## Documentación del proyecto

Documentación ubicada en <https://getsqlpad.com>.

Fuente de documentación ubicada en [Directorio docs](https://github.com/sqlpad/sqlpad/tree/master/docs), construido/renderizado por docsify.

## Estado del proyecto

A pesar del desarrollo reciente este último año y el traslado a la organización de GitHub, SQLPad está en su mayoría "terminado" en el sentido de que no cambiará radicalmente de lo que es hoy.

Versiones de mantenimiento y correcciones de errores garantizadas hasta 2021.

## Contribuyendo

[¡Los colaboradores siempre son bienvenidos!](https://github.com/sqlpad/sqlpad/blob/master/CONTRIBUTING.md)

## Licencia

MIT
