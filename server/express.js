import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import Template from './../template'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'

// modules for server side rendering
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import MainRouter from './../client/MainRouter'
import { StaticRouter } from 'react-router-dom'

import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles'
import theme from './../client/theme'
//end

//comment out before building for production
import devBundle from './devBundle'

const CURRENT_WORKING_DIR = process.cwd();
const app = express();

//comment out before building for production
devBundle.compile(app);

// parse body params and attache them to req.body
/*чтобы справиться со сложностями синтаксического анализа потоковых объектов запроса,
    чтобы мы могли упростить связь между браузером и сервером, обмениваясь JSON в теле запроса.
    установка npm install body-parser*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*для синтаксического анализа файлов cookie и установки файлов cookie в объектах запроса.
* установка - npm install cookie-parser*/
app.use(cookieParser());
/*модуль сжатия. ПО промежуточного слоя сжатия,
    которое будет пытаться сжимать тела ответов для всех запросов, проходящих через промежуточное ПО.
    установка - npm install compression*/
app.use(compress());
// secure apps by setting various HTTP headers
/*Набор функций промежуточного программного обеспечения для защиты приложений Express
путем установки различных заголовков HTTP.
установка - npm install helmet*/
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
/*Промежуточное ПО для обеспечения совместного использования ресурсов из разных источников (CORS).
* устанвока - npm install cors*/
app.use(cors());

app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

// mount routes
app.use('/', userRoutes);
app.use('/', authRoutes);

app.get('*', (req, res) => {
    const sheets = new ServerStyleSheets();
    const context = {};
    const markup = ReactDOMServer.renderToString(
        sheets.collect(
            <StaticRouter location={req.url} context={context}>
                <ThemeProvider theme={theme}>
                    <MainRouter />
                </ThemeProvider>
            </StaticRouter>
        )
    );
    if (context.url) {
        return res.redirect(303, context.url)
    }
    const css = sheets.toString();
    res.status(200).send(Template({
        markup: markup,
        css: css
    }))
});

// Catch unauthorised errors

/*Чтобы обрабатывать связанные с аутентификацией ошибки, выдаваемые express-jwt,
    когда он пытается проверить токены JWT во входящих запросах*/

/*express-jwt выдает ошибку UnauthorizedError, если по какой-либо причине токен не может быть проверен.
    Мы перехватываем эту ошибку здесь, чтобы вернуть запрашивающему клиенту статус 401.
Мы также добавляем ответ, который будет отправлен, если здесь будут сгенерированы и обнаружены
другие ошибки на стороне сервера.*/
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({"error" : err.name + ": " + err.message})
    }else if (err) {
        res.status(400).json({"error" : err.name + ": " + err.message});
        console.log(err)
    }
});

export default app;
