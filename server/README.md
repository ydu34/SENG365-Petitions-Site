# SENG365 2020 Assignment 1

> The backend of the petition site

## Running locally

1. Use `npm install` to populate the `node_modules/` directory with up-to-date packages
2. Create a file called `.env`, following the instructions in the section below
3. Run `npm run start` or `npm run debug` to start the server
4. The server will be accessible on `localhost:4941`

### `.env` file
Create a `.env` file in the root directory of this project including the following information:

```
SENG365_MYSQL_HOST={database host server}
SENG365_MYSQL_USER={your usercode}
SENG365_MYSQL_PASSWORD={your password}
SENG365_MYSQL_DATABASE={a database starting with your usercode then an underscore}
```