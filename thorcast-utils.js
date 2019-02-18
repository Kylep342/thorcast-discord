const http = require('http')


exports.processCommand = (receivedMessage, REPrefix) => {
    const commandRegex = new RegExp(`${REPrefix} (?:(help)|(?:([a-zA-Z ]+), ?([a-zA-Z ]+),? ?([a-zA-Z ]+)?))$`, 'gm')
    let matches = commandRegex.exec(receivedMessage.content)

    if (matches) {
        console.log('Command received')
        if (matches[1]) {
            receivedMessage.channel.send(helpMessage())
        } else {
            //receivedMessage.channel.send(forecastControl(matches, receivedMessage))
            forecastControl(matches, receivedMessage)
        }
    } else {
        return
    }
}


function forecastControl(regexMatch, receivedMessage) {
    let city
    let state
    let period = false;
    let url = ''
    if (regexMatch[4]) {
        city = regexMatch[2].replace(' ', '%20')
        state = regexMatch[3].replace(' ', '%20')
        period = regexMatch[4].replace(' ', '%20')
        url = `${THORCAST_API_URL}/api/city=${city}&state=${state}&period=${period}`
    } else {
        city = regexMatch[2].replace(' ', '%20')
        state = regexMatch[3].replace(' ', '%20')
        url = `${THORCAST_API_URL}/api/city=${city}&state=${state}`
    }
    //const forecast = getForecast(url, receivedMessage)
    //console.log(forecast)
    //return forecast
    getForecast(url, receivedMessage);
}


function getForecast(url, receivedMessage) {
    http.get(url, (resp) => {
        let data = ''

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            //console.log(data);
            //console.log(data.length);
            const forecast = JSON.parse(data);
            receivedMessage.channel.send(forecast.forecast);
        });
    });
    //return forecast
    /*.on('error', (err) => {
            console.log(`Error: ${err.message}`);
    });*/
}


function helpMessage() {
    return `
    Usage:
    !thorcast|!thor city, state, {{ period }}?

    Examples:
    !thor Chicago, IL, Tomorrow night
    !thorcast Los Angeles, California
    `.replace(/^[\t ]+/gm, '').replace(/[\t ]+$/gm, '\n')
}
