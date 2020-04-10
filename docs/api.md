# API

SQLPad aims to implement a REST-ish API, and as of v5, is going to use [JSON:API](https://jsonapi.org/) as a guide where possible. While 100% adherence to the spec would be nice, that likely won't be possible right away due to some old API design decisions.

For the inital implementation of the document structure, top-level attributes `data` and `errors` will be provided. Additional optional top-level attributes can be added later. HTTP status codes will be used as you might expect them to be (500 for server error, 404 for not found, etc.)

TODO: (`id`, `type`, `attributes`, anything more?)
