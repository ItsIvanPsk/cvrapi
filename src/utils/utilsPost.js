'use strict';
const url = require('url');

class Obj {
    // Agafa les dades que arriben d'una crida POST i retorna un objecte JSON
    static getPostObject(request) {
        return new Promise((resolve, reject) => {
            let body = '';
            let error = null;

            request.on('data', (data) => {
                body += data.toString();
                console.log('Received chunk of data:', data.toString());
            });

            request.on('close', () => {
                console.log('Client closed connection.');
                error = 'Client closed connection';
            });

            request.on('error', (err) => {
                console.error('Error getting data:', err);
                error = 'Error getting data';
            });

            request.on('end', () => {
                console.log('Request data collection ended.');
                if (error !== null) {
                    console.log('Error getting data from post:', error);
                    return reject(error);
                } else {
                    try {
                        let objPost;
                        if (body.charAt(0) === '{') {
                            // POST from AJAX
                            try {
                                objPost = JSON.parse(body);
                            } catch (e) {
                                console.log('Error parsing JSON from:', body);
                                return reject('Error parsing JSON');
                            }
                        } else {
                            // POST from form
                            let params = new URLSearchParams(body);
                            objPost = Object.fromEntries(params);
                        }

                        let keys = Object.keys(objPost);
                        for (let cnt = 0; cnt < keys.length; cnt++) {
                            let value = objPost[keys[cnt]];
                            if (!isNaN(value)) { // Check if is a number (example: "2ABC" is not a 2)
                                let valueInt = parseInt(value);
                                let valueFlt = parseFloat(value);
                                if (valueInt && valueFlt) {
                                    if (valueInt == valueFlt) objPost[keys[cnt]] = valueInt;
                                    else objPost[keys[cnt]] = valueFlt;
                                }
                            }
                        }
                        return resolve(objPost);
                    } catch (e) {
                        console.log('Error parsing data from post:', e);
                        return reject(e);
                    }
                }
            });
        });
    }
}

// Export
module.exports = Obj;
