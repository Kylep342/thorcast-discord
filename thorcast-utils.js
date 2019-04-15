const http = require('http')


exports.processCommand = (message, REPrefix) => {
    const commandRegex = new RegExp(`${REPrefix} (?:(help|random)|(?:([a-zA-Z ]+), ?([a-zA-Z ]+),? ?([a-zA-Z ]+)?))$`, 'gm')
    let matches = commandRegex.exec(message.content)

    if (matches) {
        console.log('Command received')
        if (matches[1]) {
            switch(matches[1]) {
                case 'help':
                    message.channel.send(helpMessage())
                    break;
                case 'random':
                    randomForecast(message)
                    break;
            }
        } else {
            forecastControl(matches, message)
        }
    } else {
        return
    }
}


function forecastControl(regexMatch, message) {
    let city
    let state
    let period = false;
    let url = ''
    if (regexMatch[4]) {
        city = regexMatch[2].replace(/ /g, '+')
        state = regexMatch[3].replace(/ /g, '+')
        period = regexMatch[4].replace(/ /g, '+')
        url = `${THORCAST_API_URL}/api/forecast/city=${city}&state=${state}&period=${period}`
    } else {
        city = regexMatch[2].replace(/ /g, '+')
        state = regexMatch[3].replace(/ /g, '+')
        url = `${THORCAST_API_URL}/api/forecast/city=${city}&state=${state}`
    }
    getForecast(url, message);
}


function randomForecast(message) {
    url = `${THORCAST_API_URL}/api/forecast/random`
    getForecast(url, message)
}


function getForecast(url, message) {
    http.get(url, (resp) => {
            
        let data = ''

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            try {
                const apiResponse = JSON.parse(data);
                if (resp.statusCode === 200) {
                    message.channel.send(apiResponse.forecast);
                } else {
                    handleError(resp.statusCode, apiResponse, message);
                }
            } catch (e) {
                console.error(e.message);
            }
        });
    })
}


function handleError(statusCode, resp, message) {
    let errorMessage;
    switch (statusCode) {
        case 404:
            errorMessage = `${resp.info}
            Your inputs:
            City: ${resp.city}
            State: ${resp.state}
            Period: ${resp.period}
            Please ensure you've spelled everything correctly, then try again.
            `.replace(/^[\t ]+/gm, '').replace(/[\t ]+$/gm, '\n')
            break;
        case 500:
            errorMessage = resp.message
            break;
    }
    message.channel.send(errorMessage);
}


function helpMessage() {
    return `
    Usage:

    --------

    Get a forecast for a chosen city, state, and period
    (!thorcast|!thor|@Thorcast) city, state{{, period }}

    Examples:
    !thor Chicago, IL, Tomorrow night
    !thorcast Los Angeles, California
    @Thorcast New York City, New York, Wednesday

    --------

    Get a random forecast:
    (!thorcast|!thor|@Thorcast) random
    `.replace(/^[\t ]+/gm, '').replace(/[\t ]+$/gm, '\n')
}
