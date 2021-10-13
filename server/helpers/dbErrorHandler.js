'use strict';
/*Обработка ошибок Mongoose*/

/*Ограничения проверки, добавленные в поля схемы пользователя, будут вызывать сообщения об ошибках,
    если они нарушаются при сохранении данных пользователя в базе данных.
    Чтобы обработать эти ошибки проверки и другие ошибки, которые база данных может выдавать,
    когда мы делаем к ней запросы, мы определим вспомогательный метод, который будет возвращать
соответствующее сообщение об ошибке, которое может быть распространено в цикле запрос-ответ при необходимости.*/

/**
 * Get unique error field name
 */

/*Ошибки, которые не возникают из-за нарушения валидатора Mongoose, будут содержать связанный код ошибки.
    В некоторых случаях с этими ошибками нужно обращаться иначе. Например, ошибки, вызванные нарушением
ограничения уникальности, вернут объект ошибки, отличный от ошибок проверки Mongoose.
    Параметр unique является не валидатором, а удобным помощником для создания уникальных индексов MongoDB,
    поэтому мы добавим еще один метод getUniqueErrorMessage для анализа уникального объекта ошибки,
    связанного с ограничением, и создания соответствующего сообщения об ошибке.*/

const getUniqueErrorMessage = (err) => {
    let output;
    try {
        let fieldName = err.message.substring(err.message.lastIndexOf('.$') + 2, err.message.lastIndexOf('_1'));
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists'
    } catch (ex) {
        output = 'Unique field already exists'
    }

    return output
};

/**
 * Get the error message from error object
 */

/*Этот метод проанализирует и вернет сообщение об ошибке, связанное с конкретной ошибкой проверки или другими ошибками,
    которые могут возникнуть при запросе MongoDB с использованием Mongoose.*/

const getErrorMessage = (err) => {
    let message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = getUniqueErrorMessage(err);
                break;
            default:
                message = 'Something went wrong'
        }
    } else {
        for (let errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message
        }
    }

    return message
};

/*Используя функцию getErrorMessage, которая экспортируется из этого вспомогательного файла,
    мы можем добавлять значимые сообщения об ошибках при обработке ошибок, возникающих в
результате операций Mongoose.*/

export default {getErrorMessage}
