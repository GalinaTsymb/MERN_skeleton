import express from 'express'
import authCtrl from '../controllers/auth.controller'

const router = express.Router();

/*Чтобы ограничить доступ к пользовательским операциям, таким как просмотр профиля пользователя,
    обновление пользователя и удаление пользователя, мы сначала реализуем аутентификацию входа
с помощью JWT, а затем будем использовать ее для защиты и авторизации маршрутов чтения, обновления и удаления.*/

router.route('/auth/signin')
    //POST-запрос для аутентификации пользователя с его адресом электронной почты и паролем.
    .post(authCtrl.signin);
router.route('/auth/signout')
    //Запрос GET для очистки файла cookie, содержащего JWT, который был установлен в объекте ответа после входа в систему.
    .get(authCtrl.signout);

export default router
