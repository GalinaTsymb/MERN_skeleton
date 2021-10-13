import mongoose from 'mongoose';
import crypto from 'crypto';

/*Функция mongoose.Schema () принимает объект определения схемы в качестве параметра для создания нового объекта
схемы Mongoose, который будет определять свойства или структуру каждого документа в коллекции.*/
    const UserSchema = new mongoose.Schema({
        //Поле имени является обязательным полем типа Строка.В этом поле будет храниться имя пользователя.
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
        /*Значение, которое будет сохранено в этом поле электронной почты, должно иметь допустимый формат электронной
        почты и также должно быть уникальным в коллекции пользователей.*/
    email: {
        type: String,
        trim: true,
        unique: 'Email already exists',
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: 'Email is required'
    },
        /*Поля hashed_password и salt представляют зашифрованный пароль пользователя,
        который мы будем использовать для аутентификации.*/
    hashed_password: {
        type: String,
        required: "Password is required"
    },
    salt: String,
        /*Созданные и обновленные временные метки
        Эти значения даты будут сгенерированы программно для записи временных меток, указывающих,
        когда создается пользователь и обновляются данные пользователя.*/
    updated: Date,
    created: {
        type: Date,
        default: Date.now
    }
});

/*Поле пароля очень важно для обеспечения безопасной аутентификации пользователя в любом приложении, и каждый пароль
пользователя должен быть зашифрован, подтвержден и надежно аутентифицирован как часть модели пользователя.*/

/*Строка пароля, предоставленная пользователем, не сохраняется непосредственно в пользовательском документе.
    Вместо этого он обрабатывается как виртуальное поле*/

/*Когда значение пароля получено при создании или обновлении пользователя, оно зашифровывается в новое хешированное
значение и устанавливается в поле hashed_password вместе с уникальным значением соли в поле соли.*/

UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function() {
        return this._password
    });


/*Проверка поля пароля*/

/*Чтобы добавить ограничения проверки к фактической строке пароля, выбранной конечным пользователем,
    нам нужно добавить настраиваемую логику проверки и связать ее с полем hashed_password в схеме.*/

UserSchema.path('hashed_password').validate(function(v) {
    if (this._password && this._password.length < 6) {
        this.invalidate('password', 'Password must be at least 6 characters.')
    }
    if (this.isNew && !this._password) {
        this.invalidate('password', 'Password is required')
    }
}, null)

/*Шифрование и аутентификация*/

/*Логика шифрования и логика генерации соли, которые используются для генерации значений hashed_password и salt,
    представляющих значение пароля, определены как методы UserSchema.*/

/*Authenticate: этот метод вызывается для проверки попыток входа в систему путем сопоставления предоставленного
пользователем текста пароля с hashed_password, хранящимся в базе данных для конкретного пользователя.*/

/*encryptPassword: этот метод используется для генерации зашифрованного хэша из простого текстового пароля и
уникального значения соли с использованием криптографического модуля из Node.*/

/*makeSalt: этот метод генерирует уникальное и случайное значение соли, используя текущую временную метку
при выполнении и Math.random ().*/

/*В нашем коде мы используем алгоритм хеширования SHA1 и createHmac из криптографии, чтобы сгенерировать
криптографический хеш HMAC из пары текста и соли.*/

UserSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password
    },
    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (err) {
            return ''
        }
    },
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + ''
    }
};

/*Эти методы UserSchema используются для шифрования предоставленной пользователем строки пароля в hashed_password
со случайно сгенерированным значением соли. Hashed_password и соль сохраняются в пользовательском документе,
    когда данные пользователя сохраняются в базе данных при создании или обновлении. Оба значения hashed_password
и salt необходимы для сопоставления и аутентификации строки пароля, предоставленной во время входа пользователя
в систему с использованием метода аутентификации. Мы также должны убедиться, что пользователь для начала выбирает
надежную строку пароля, что можно сделать, добавив настраиваемую проверку в поле паспорта.*/

export default mongoose.model('User', UserSchema)
