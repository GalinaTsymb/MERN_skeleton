import User from '../models/user.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'

//Он также будет использовать модуль lodash при обновлении существующего пользователя с измененными значениями.

/*lodash - это библиотека JavaScript, которая предоставляет служебные функции для общих задач программирования,
    включая управление массивами и объектами. Чтобы установить lodash, запустите npm install lodash из командной
строки.*/

const create = async (req, res) => {
    const user = new User(req.body);
    try {
        //Вызов user.save пытается сохранить нового пользователя в базе данных после того, как Mongoose выполнил проверку данных.
        await user.save();

        //Следовательно, запрашивающему клиенту возвращается ответ об ошибке или успешный ответ.
        return res.status(200).json({
            message: "Successfully signed up!"
        })
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
};

/**
 * Load user and append to req.
 */

/*Функция контроллера userByID использует значение параметра: userId для запроса базы данных по _id и
загрузки соответствующих сведений о пользователе.*/

/*Если соответствующий пользователь найден в базе данных, объект пользователя добавляется к объекту
запроса в ключе профиля. Затем промежуточное ПО next () используется для передачи управления следующей
соответствующей функции контроллера. Например, если исходный запрос был на чтение профиля пользователя,
    вызов next () в userByID перешел бы к функции контроллера чтения, которая обсуждается далее.*/

const userByID = async (req, res, next, id) => {
    try {
        let user = await User.findById(id);
        if (!user)
            return res.status('400').json({
                error: "User not found"
            });
        req.profile = user;
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve user"
        })
    }
};

/*Функция чтения извлекает сведения о пользователе из req.profile и удаляет конфиденциальную информацию,
    такую ​​как hashed_password и значения соли, перед отправкой объекта пользователя в ответ
запрашивающему клиенту. Это правило также соблюдается при реализации функции контроллера для
обновления пользователя, как показано ниже.*/

const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile)
};

/*Функция контроллера списка находит всех пользователей из базы данных, заполняет только имя,
    адрес электронной почты, созданные и обновленные поля в результирующем списке пользователей,
    а затем возвращает этот список пользователей в виде объектов JSON в массиве запрашивающему клиенту.*/

const list = async (req, res) => {
    try {
        let users = await User.find().select('name email updated created')
        res.json(users)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
};

/*Функция обновления извлекает сведения о пользователе из req.profile, а затем использует модуль lodash
для расширения и объединения изменений, которые поступили в теле запроса, для обновления данных пользователя.
    Перед сохранением этого обновленного пользователя в базе данных обновленное поле заполняется текущей датой,
    чтобы отразить последнюю обновленную метку времени. После успешного сохранения этого обновления обновленный
объект пользователя очищается путем удаления конфиденциальных данных, таких как hashed_password и salt,
    перед отправкой объекта пользователя в ответ запрашивающему клиенту.*/
const update = async (req, res) => {
    try {
        let user = req.profile;
        user = extend(user, req.body);
        user.updated = Date.now();
        await user.save();
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
};

/*Функция remove извлекает пользователя из req.profile и использует запрос remove () для удаления пользователя
из базы данных. При успешном удалении запрашивающему клиенту в ответе возвращается удаленный объект пользователя.*/
const remove = async (req, res) => {
    try {
        let user = req.profile;
        let deletedUser = await user.remove();
        deletedUser.hashed_password = undefined;
        deletedUser.salt = undefined;
        res.json(deletedUser)
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
};

export default {
    create,
    userByID,
    read,
    list,
    remove,
    update
}
