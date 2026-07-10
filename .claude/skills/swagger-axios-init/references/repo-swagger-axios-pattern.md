# KNE CP FE Swagger Plus Axios Pattern

Use this reference when the target repository matches `/Users/dave/Documents/React/kne-cp-fe`.

## Shared axios instance

`src/config/axios.ts` currently:

- creates one shared axios instance
- applies timeout and base URL defaults
- injects auth headers through request interceptors
- refreshes access tokens through a shared auth flow

Preserve those behaviors when updating the shared client.

## Shared Swagger client instance

`src/config/api.ts` currently:

- imports `Api as SwaggerApi` from `@/models`
- imports the shared axios instance
- creates one `apiInstance`
- injects the axios instance with `apiInstance.instance = axiosInstance`

This is the repository's preferred shared client pattern.

## Design rules

- Keep Swagger client construction centralized.
- Do not instantiate generated clients inside feature modules.
- Keep auth login or token refresh exceptions separate when the repository already does so.
