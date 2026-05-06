# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

```
frontend
├─ .editorconfig
├─ .postcssrc.json
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  └─ favicon.ico
├─ README.md
├─ src
│  ├─ app
│  │  ├─ app.config.ts
│  │  ├─ app.css
│  │  ├─ app.html
│  │  ├─ app.routes.ts
│  │  ├─ app.spec.ts
│  │  ├─ app.ts
│  │  ├─ dashboard
│  │  │  ├─ dashboard.css
│  │  │  ├─ dashboard.html
│  │  │  ├─ dashboard.spec.ts
│  │  │  └─ dashboard.ts
│  │  └─ login
│  │     ├─ login.css
│  │     ├─ login.html
│  │     ├─ login.spec.ts
│  │     └─ login.ts
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.css
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```
```
frontend
├─ .angular
├─ .editorconfig
├─ .postcssrc.json
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  └─ favicon.ico
├─ README.md
├─ src
│  ├─ app
│  │  ├─ app.config.ts
│  │  ├─ app.css
│  │  ├─ app.html
│  │  ├─ app.routes.ts
│  │  ├─ app.spec.ts
│  │  ├─ app.ts
│  │  ├─ dashboard
│  │  │  ├─ dashboard.css
│  │  │  ├─ dashboard.html
│  │  │  ├─ dashboard.spec.ts
│  │  │  └─ dashboard.ts
│  │  ├─ login
│  │  │  ├─ login.css
│  │  │  ├─ login.html
│  │  │  ├─ login.spec.ts
│  │  │  └─ login.ts
│  │  ├─ services
│  │  │  └─ usuario.service.ts
│  │  ├─ sidebar
│  │  │  ├─ sidebar.css
│  │  │  ├─ sidebar.html
│  │  │  ├─ sidebar.spec.ts
│  │  │  └─ sidebar.ts
│  │  └─ usuarios
│  │     ├─ crear-usuario
│  │     │  ├─ crear-usuario.css
│  │     │  ├─ crear-usuario.html
│  │     │  ├─ crear-usuario.spec.ts
│  │     │  └─ crear-usuario.ts
│  │     └─ lista-usuarios
│  │        ├─ lista-usuarios.css
│  │        ├─ lista-usuarios.html
│  │        ├─ lista-usuarios.spec.ts
│  │        └─ lista-usuarios.ts
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.css
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```
```
frontend
├─ .angular
├─ .editorconfig
├─ .postcssrc.json
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.ico
│  └─ fondo.jpg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ app.config.ts
│  │  ├─ app.css
│  │  ├─ app.html
│  │  ├─ app.routes.ts
│  │  ├─ app.spec.ts
│  │  ├─ app.ts
│  │  ├─ camas
│  │  │  └─ seleccion-camas
│  │  │     ├─ seleccion-camas.css
│  │  │     ├─ seleccion-camas.html
│  │  │     ├─ seleccion-camas.spec.ts
│  │  │     └─ seleccion-camas.ts
│  │  ├─ dashboard
│  │  │  ├─ dashboard.css
│  │  │  ├─ dashboard.html
│  │  │  ├─ dashboard.spec.ts
│  │  │  └─ dashboard.ts
│  │  ├─ evaluacion
│  │  │  ├─ calculadora
│  │  │  ├─ calculos-detallados
│  │  │  │  ├─ calculos-detallados.css
│  │  │  │  ├─ calculos-detallados.html
│  │  │  │  ├─ calculos-detallados.spec.ts
│  │  │  │  └─ calculos-detallados.ts
│  │  │  ├─ formulario-evaluacion
│  │  │  │  ├─ formulario-evaluacion.css
│  │  │  │  ├─ formulario-evaluacion.html
│  │  │  │  ├─ formulario-evaluacion.spec.ts
│  │  │  │  └─ formulario-evaluacion.ts
│  │  │  ├─ lista-evaluaciones
│  │  │  │  ├─ lista-evaluaciones.css
│  │  │  │  ├─ lista-evaluaciones.html
│  │  │  │  ├─ lista-evaluaciones.spec.ts
│  │  │  │  └─ lista-evaluaciones.ts
│  │  │  └─ resultados-evaluacion
│  │  │     ├─ resultados-evaluacion.css
│  │  │     ├─ resultados-evaluacion.html
│  │  │     ├─ resultados-evaluacion.spec.ts
│  │  │     └─ resultados-evaluacion.ts
│  │  ├─ guards
│  │  │  └─ auth.guard.ts
│  │  ├─ login
│  │  │  ├─ login.css
│  │  │  ├─ login.html
│  │  │  ├─ login.spec.ts
│  │  │  └─ login.ts
│  │  ├─ molecula
│  │  │  ├─ lista-molecula
│  │  │  │  ├─ lista-molecula.css
│  │  │  │  ├─ lista-molecula.html
│  │  │  │  ├─ lista-molecula.spec.ts
│  │  │  │  └─ lista-molecula.ts
│  │  │  └─ modal-molecula
│  │  │     ├─ modal-molecula.css
│  │  │     ├─ modal-molecula.html
│  │  │     ├─ modal-molecula.spec.ts
│  │  │     └─ modal-molecula.ts
│  │  ├─ pacientes
│  │  │  ├─ lista-pacientes
│  │  │  │  ├─ lista-pacientes.css
│  │  │  │  ├─ lista-pacientes.html
│  │  │  │  ├─ lista-pacientes.spec.ts
│  │  │  │  └─ lista-pacientes.ts
│  │  │  └─ modal-paciente
│  │  │     ├─ modal-paciente.css
│  │  │     ├─ modal-paciente.html
│  │  │     ├─ modal-paciente.spec.ts
│  │  │     └─ modal-paciente.ts
│  │  ├─ requerimiento
│  │  │  ├─ lista-requerimientos
│  │  │  │  ├─ lista-requerimientos.css
│  │  │  │  ├─ lista-requerimientos.html
│  │  │  │  ├─ lista-requerimientos.spec.ts
│  │  │  │  └─ lista-requerimientos.ts
│  │  │  └─ modal-requerimiento
│  │  │     ├─ modal-requerimiento.css
│  │  │     ├─ modal-requerimiento.html
│  │  │     ├─ modal-requerimiento.spec.ts
│  │  │     └─ modal-requerimiento.ts
│  │  ├─ services
│  │  │  └─ usuario.service.ts
│  │  ├─ sidebar
│  │  │  ├─ sidebar.css
│  │  │  ├─ sidebar.html
│  │  │  ├─ sidebar.spec.ts
│  │  │  └─ sidebar.ts
│  │  └─ usuarios
│  │     ├─ crear-usuario
│  │     │  ├─ crear-usuario.css
│  │     │  ├─ crear-usuario.html
│  │     │  ├─ crear-usuario.spec.ts
│  │     │  └─ crear-usuario.ts
│  │     ├─ lista-usuarios
│  │     │  ├─ lista-usuarios.css
│  │     │  ├─ lista-usuarios.html
│  │     │  ├─ lista-usuarios.spec.ts
│  │     │  └─ lista-usuarios.ts
│  │     └─ modal-usuario
│  │        ├─ modal-usuario.css
│  │        ├─ modal-usuario.html
│  │        ├─ modal-usuario.spec.ts
│  │        └─ modal-usuario.ts
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.css
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```
```
frontend
├─ .angular
├─ .editorconfig
├─ .postcssrc.json
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.ico
│  └─ fondo.jpg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ app.config.ts
│  │  ├─ app.css
│  │  ├─ app.html
│  │  ├─ app.routes.ts
│  │  ├─ app.spec.ts
│  │  ├─ app.ts
│  │  ├─ camas
│  │  │  └─ seleccion-camas
│  │  │     ├─ seleccion-camas.css
│  │  │     ├─ seleccion-camas.html
│  │  │     ├─ seleccion-camas.spec.ts
│  │  │     └─ seleccion-camas.ts
│  │  ├─ dashboard
│  │  │  ├─ dashboard.css
│  │  │  ├─ dashboard.html
│  │  │  ├─ dashboard.spec.ts
│  │  │  └─ dashboard.ts
│  │  ├─ evaluacion
│  │  │  ├─ calculadora
│  │  │  ├─ calculos-detallados
│  │  │  │  ├─ calculos-detallados.css
│  │  │  │  ├─ calculos-detallados.html
│  │  │  │  ├─ calculos-detallados.spec.ts
│  │  │  │  └─ calculos-detallados.ts
│  │  │  ├─ formulario-evaluacion
│  │  │  │  ├─ formulario-evaluacion.css
│  │  │  │  ├─ formulario-evaluacion.html
│  │  │  │  ├─ formulario-evaluacion.spec.ts
│  │  │  │  └─ formulario-evaluacion.ts
│  │  │  ├─ lista-evaluaciones
│  │  │  │  ├─ lista-evaluaciones.css
│  │  │  │  ├─ lista-evaluaciones.html
│  │  │  │  ├─ lista-evaluaciones.spec.ts
│  │  │  │  └─ lista-evaluaciones.ts
│  │  │  └─ resultados-evaluacion
│  │  │     ├─ resultados-evaluacion.css
│  │  │     ├─ resultados-evaluacion.html
│  │  │     ├─ resultados-evaluacion.spec.ts
│  │  │     └─ resultados-evaluacion.ts
│  │  ├─ guards
│  │  │  └─ auth.guard.ts
│  │  ├─ login
│  │  │  ├─ login.css
│  │  │  ├─ login.html
│  │  │  ├─ login.spec.ts
│  │  │  └─ login.ts
│  │  ├─ molecula
│  │  │  ├─ lista-molecula
│  │  │  │  ├─ lista-molecula.css
│  │  │  │  ├─ lista-molecula.html
│  │  │  │  ├─ lista-molecula.spec.ts
│  │  │  │  └─ lista-molecula.ts
│  │  │  ├─ modal-grafico-3d
│  │  │  │  ├─ modal-grafico-3d.css
│  │  │  │  ├─ modal-grafico-3d.html
│  │  │  │  └─ modal-grafico-3d.ts
│  │  │  └─ modal-molecula
│  │  │     ├─ modal-molecula.css
│  │  │     ├─ modal-molecula.html
│  │  │     ├─ modal-molecula.spec.ts
│  │  │     └─ modal-molecula.ts
│  │  ├─ pacientes
│  │  │  ├─ lista-pacientes
│  │  │  │  ├─ lista-pacientes.css
│  │  │  │  ├─ lista-pacientes.html
│  │  │  │  ├─ lista-pacientes.spec.ts
│  │  │  │  └─ lista-pacientes.ts
│  │  │  └─ modal-paciente
│  │  │     ├─ modal-paciente.css
│  │  │     ├─ modal-paciente.html
│  │  │     ├─ modal-paciente.spec.ts
│  │  │     └─ modal-paciente.ts
│  │  ├─ requerimiento
│  │  │  ├─ lista-requerimientos
│  │  │  │  ├─ lista-requerimientos.css
│  │  │  │  ├─ lista-requerimientos.html
│  │  │  │  ├─ lista-requerimientos.spec.ts
│  │  │  │  └─ lista-requerimientos.ts
│  │  │  ├─ modal-grafico-requerimiento
│  │  │  │  ├─ modal-grafico-requerimiento.css
│  │  │  │  ├─ modal-grafico-requerimiento.html
│  │  │  │  └─ modal-grafico-requerimiento.ts
│  │  │  └─ modal-requerimiento
│  │  │     ├─ modal-requerimiento.css
│  │  │     ├─ modal-requerimiento.html
│  │  │     ├─ modal-requerimiento.spec.ts
│  │  │     └─ modal-requerimiento.ts
│  │  ├─ services
│  │  │  └─ usuario.service.ts
│  │  ├─ sidebar
│  │  │  ├─ sidebar.css
│  │  │  ├─ sidebar.html
│  │  │  ├─ sidebar.spec.ts
│  │  │  └─ sidebar.ts
│  │  └─ usuarios
│  │     ├─ crear-usuario
│  │     │  ├─ crear-usuario.css
│  │     │  ├─ crear-usuario.html
│  │     │  ├─ crear-usuario.spec.ts
│  │     │  └─ crear-usuario.ts
│  │     ├─ lista-usuarios
│  │     │  ├─ lista-usuarios.css
│  │     │  ├─ lista-usuarios.html
│  │     │  ├─ lista-usuarios.spec.ts
│  │     │  └─ lista-usuarios.ts
│  │     └─ modal-usuario
│  │        ├─ modal-usuario.css
│  │        ├─ modal-usuario.html
│  │        ├─ modal-usuario.spec.ts
│  │        └─ modal-usuario.ts
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.css
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```