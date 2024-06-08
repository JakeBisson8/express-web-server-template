# express-web-server-template

## About 📖 <a name="about"></a>

A basic expressJS web server for Windows with support for HTTPS and running as a Windows service.

## Inspiration 💡 <a name="inspo"></a>

I was given the challenge of deploying an Angular application to a on-premise Windows server and decided to ditch Apache for NodeJS + ExpressJS. After deploying the application I decided it would be a great idea to maintain a template for the web server to make deployment easier the next go round.

## Dependencies 🧩 <a name="dependencies"></a>

- [express](https://expressjs.com/)
- [helmet](https://helmetjs.github.io/)
- [dotenv-safe](https://www.npmjs.com/package/dotenv-safe)

## Prerequisites

1. You must have NodeJS installed.

## Installation 💾 <a name="installation"></a>

1. Select to use this template through GitHub and create a new repository.
2. Clone your new repository.

```bash
git clone <repository_link>.git
```

3. Update `package.json` to replace the `name`, `description`, `version`, `repository`, `author` properties to match your project.
4. Install project dependencies using your package manager of choice.

```bash
npm install
```

5. Make a copy of `.env.example` called `.env`. You may choose to customize the environment variables to your liking or you can leave them as is. See [Environment Variables](#env) for more info.
6. Create an `index.html` under the `app/` directory to simulate an app.
7. Run the following command and navigate to [http://localhost](http://localhost).

```html
<!-- app/index.html -->
<h1>Hello World!</h1>
```

```bash
npm run start
```

8. 🎉 **Congratulations** 🎉 You have successfully installed the web server. You're not done yet! Check out the guides below to serve your application, setup HTTPS, and install the web server as a Windows service.
   - [Serving Your Application](#serve)
   - [Setting up HTTPS](#https)
   - [Installing Windows Service](#service)

## Serving Your Application 🍽 <a name="serve"></a>

**Disclaimer:** No two apps are exactly the same with their requirements for the web server. I will try my best to describe how the majority of you will find success with serving your application. Some of you may need to dig a little deeper and config a little more configure to get your app served.

1. Build your application (assuming you're using some sort of framework that requires a build step). for an Angular application you can build using `npm run build` or `ng build --prod`
2. Copy your build to the `app/` directory. You are required to copy `index.html` and its supporting files directly to `app/`, you're not copying over the folder named after your project.

   - Why? because the web server is configured to serve `app/index.html`. Don't like it? change it!

3. Run the web server and access your application at [http://localhost](http://localhost)

```bash
npm run start
```

4. If your app IS NOT working, it could be how it is being served. This web server routes all requests to `app/index.html` as this is required for SPAs. Here's where you have to start digging and making your own configs and changes to get it to work for you.

5. If you notice CSS isn't CSSing or maybe you're using Angular with TailwindCSS like I am in my (shameless plug) [Angular 17 Template](https://github.com/JakeBisson8/angular-17-app-template) and Tailwind isn't winding? You might have to configure [helmet's Content Security Policy (CSP)](https://helmetjs.github.io/#content-security-policy). Opening Chrome Dev Tools (F12) you may see an error in the console related to the CSP. You will find the `contentSecurityPolicy` where we use helmet as middleware where you can configure it to your heart's content.
   - Using TailwindCSS with Angular I had to define `script-src-attr` to use `unsafe-inline` for it to work. I don't make the rules.
   - For more info about CSP read the [mdn docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

```ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src-attr": ["'unsafe-inline'"],
      },
    },
  })
);
```

6. If your app IS working and looking great then awesome you've done it.

## Setting up HTTPS 🔒 <a name="https"></a>

All you need for HTTPS is a private key, certificate. Don't have one yet? You can try it out by using a self-signed certificate. Pssst... If you're allowing ciphers that use DH params then you will need that too 😉.

0. To create a self-signed certificate, [Install OpenSSL](https://tecadmin.net/install-openssl-on-windows/) then open a shell to the `ssl/` directory and run the following commands. For DH Params, the command is here too.

```bash
# Generate private key
openssl genrsa -out key.key 2048

# Generate CSR
openssl req -new -key key.key -out cert.csr

# Generate certificate
openssl x509 -req -days 365 -in cert.csr -signkey key.key -out cert.crt

# Generate DH Params
openssl dhparam -out dhparam.pem 2048
```

1. Open `.env` and change the `HTTPS` environment variable from `0` to `1`.
2. If you named the private key `key.key`, certificate `cert.crt` and DH params `dhparam.pem` you can skip this step. Otherwise, open `.env` and update the `SSL_CERT`, `SSL_KEY` and `DH_PARAM` environment variables to the names of your key, certificate and params respectively.
3. Run the web server and test HTTPS [https://localhost](https://localhost).

```bash
npm run start
```

**Important Note:** If you get an error from chome saying it is not safe - DON'T PANIC 😱 This is simply due to the fact that you are using a self-signed certificate. If you're using a certificate from a trusted authority then 100% investigate. If you're using self-signed cert you will also notice that HSTS may not be working. This is because the browser requires to see a valid certificate before it decides to re-route requests to HTTPS.

Curious about the default SSL/TLS configuration? see [SSL/TLS](#ssl)

## Installing as Windows Service ⚙ <a name="service"></a>

1. Open an elevated shell at your project's root folder.
2. Install [node-windows](https://www.npmjs.com/package/node-windows) globally.

```bash
npm install node-windows -g
```

3. Link [node-windows](https://www.npmjs.com/package/node-windows) in the project's root folder.

```bash
npm link node-windows
```

4. Run the script to install the windows service.

```bash
npm run install-service
```

5. 😀 Woohoo! the service has installed. This project also supports commands for starting, stopping and uninstalling the service. You can check them out in the [Scripts](#scripts) section.

## SSL/TLS 🔑 <a name="ssl"></a>

The TLS/SSL configuration that is being used is [Mozilla's modern compatibility configuration](https://wiki.mozilla.org/Security/Server_Side_TLS#Modern_compatibility). This configuration does not require DH Params as the cipher suite that is used leverages ECDH curves instead.

I would also like to specify that HSTS is configured for this web server. For those who don't know, HSTS is responsible for informing the browser it should be using HTTPS instead of HTTP. The browser will then re-route all HTTP traffic to HTTPS for you instead of hitting the server on HTTP and the server making the re-direct. For more info see [mdn docs Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security). In case you missed the important note, using a self-signed certificate may cause HSTS to not work properly as the browser wants to see a valid certificate before it re-directs all requests to HTTPS.

## Environment Variables 🌎 <a name="env"></a>

- `HTTP_PORT: number`: The port where the HTTP server will run.
- `HTTPS_PORT: number`: The port where the HTTPS server will run.
- `HTTPS: 0 | 1`: Defines if HTTPS should be enabled.
- `HSTS_MAX_AGE: number`: value for [Strict-Transport-Security max-age Directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#max-ageexpire-time).
- `HSTS_INCLUDE_SUBDOMAINS: 0 | 1`: Defines if [String-Transport-Security includeSubDomains Directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#includesubdomains) is enabled.
- `HSTS_PRELOAD: 0 | 1`: Defines if [Strict-Transport-Security preload Directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#preload) is enabled.
- `SSL_CERT: string`: The name of your SSL/TLS certificate file in `ssl/`.
- `SSL_KEY: string`: The name of your SSL/TLS private key in `ssl/`.
- `SSL_MIN_VERSION: string` The minimum SSL/TLS version to use.
- `SSL_MAX_VERSION: string` The maximum SSL/TLS version to use.
- `SSL_CIPHERS: string`: Defines the SSL/TLS cipher suite to use.
- `ECDH_CURVES: string`: Defines the SSL/TLS curves to use.
- `SERVICE_NAME: string`: Defines the name of the Windows service when installed as a service.
- `SERVICE_DESCRIPTION: string`: Defines the description of the Windows service when installed as a service.

## Scripts 📜 <a name="scripts"></a>

### Start in command line

```bash
npm run start
```

### Install Windows Service

```bash
npm run install-service
```

### Start Windows Service

```bash
npm run start-service
```

### Stop Windows Service

```bash
npm run stop-service
```

### Uninstall Windows Service

```bash
npm run uninstall-service
```
