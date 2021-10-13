import express from 'express'
import userCtrl from '../controllers/user.controller'
import authCtrl from '../controllers/auth.controller'

const router = express.Router();

router.route('/api/users')
    .get(userCtrl.list) //Список пользователей
    .post(userCtrl.create); //Creating a new user



/*Маршрут для чтения информации пользователя требует только проверки аутентификации,
    тогда как маршруты обновления и удаления должны проверять как аутентификацию,
    так и авторизацию перед выполнением этих операций CRUD.*/
router.route('/api/users/:userId')
    .get(authCtrl.requireSignin, userCtrl.read) // Получение пользователя с помощью GET
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update) //Updating a user with PUT
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove); //Deleting a user with DELETE

//мы также настроим маршрутизатор Express так, чтобы он обрабатывал параметр userId в запрошенном маршруте,
// выполняя функцию контроллера userByID.

/*Каждый раз, когда приложение Express получает запрос к маршруту, который соответствует пути,
    содержащему параметр: userId в нем, приложение выполняет функцию контроллера userByID,
    которая выбирает и загружает пользователя в объект запроса Express, прежде чем передать его следующей функции.
    это относится к поступившему запросу.*/

router.param('userId', userCtrl.userByID);

export default router
