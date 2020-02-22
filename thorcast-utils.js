const http = require("http");

// TODO: Determine architecture to support many commands
// Do research on other bots and how they are setup

exports.processCommand = message => {
    const commandRegex = new RegExp(
        `(?:(help|random)|(?:([a-zA-Z ]+), ?([a-zA-Z ]+),? ?([a-zA-Z ]+)?,? ?([0-9]+)?))$`,
        "gm"
    );
    let matches = commandRegex.exec(
        message.content
            .split(" ")
            .slice(1)
            .join(" ")
    );

    if (matches) {
        console.log(`Command received: ${matches}`);
        if (!matches[1]) {
            forecastControl(matches, message);
        } else {
            switch (matches[1]) {
                case "help":
                    message.channel.send(helpMessage());
                    break;
                case "random":
                    randomForecast(message);
                    break;
            }
        }
    } else {
        return;
    }
};

function forecastControl(regexMatch, message) {
    let city;
    let state;
    let period = false;
    let url = "";
    if (regexMatch[4] === "hourly" && regexMatch[5]) {
        city = regexMatch[2].replace(/ /g, "+");
        state = regexMatch[3].replace(/ /g, "+");
        hours = regexMatch[5];
        url = `${THORCAST_API_URL}/api/forecast/hourly?city=${city}&state=${state}&hours=${hours}`;
        getHourlyForecast(url, message);
    } else if (regexMatch[4] === "hourly") {
        city = regexMatch[2].replace(/ /g, "+");
        state = regexMatch[3].replace(/ /g, "+");
        url = `${THORCAST_API_URL}/api/forecast/hourly?city=${city}&state=${state}`;
        getHourlyForecast(url, message);
    } else if (regexMatch[4]) {
        city = regexMatch[2].replace(/ /g, "+");
        state = regexMatch[3].replace(/ /g, "+");
        period = regexMatch[4].replace(/ /g, "+");
        url = `${THORCAST_API_URL}/api/forecast/detailed?city=${city}&state=${state}&period=${period}`;
        getDetailedForecast(url, message);
    } else {
        city = regexMatch[2].replace(/ /g, "+");
        state = regexMatch[3].replace(/ /g, "+");
        url = `${THORCAST_API_URL}/api/forecast/detailed?city=${city}&state=${state}`;
        getDetailedForecast(url, message);
    }
}

function randomForecast(message) {
    url = `${THORCAST_API_URL}/api/forecast/detailed/random`;
    getDetailedForecast(url, message);
}

function getDetailedForecast(url, message) {
    http.get(url, resp => {
        let data = "";

        resp.on("data", chunk => {
            data += chunk;
        });

        resp.on("end", () => {
            try {
                const apiResponse = JSON.parse(data);
                if (resp.statusCode === 200) {
                    forecast = `${apiResponse.period}'s forecast for ${
                        apiResponse.city
                        }, ${apiResponse.state}:\n${apiResponse.forecast}`;
                    message.channel.send(forecast);
                } else {
                    handleError(resp.statusCode, apiResponse, message);
                }
            } catch (e) {
                console.error(e.message);
            }
        });
    });
}

function getHourlyForecast(url, message) {
    http.get(url, resp => {
        let data = "";

        resp.on("data", chunk => {
            data += chunk;
        });

        resp.on("end", () => {
            try {
                const apiResponse = JSON.parse(data);
                if (resp.statusCode === 200) {
                    forecast = `${apiResponse.hours} hour forecast for ${
                        apiResponse.city
                        }, ${apiResponse.state}:\n${apiResponse.forecast}`;
                    message.channel.send(forecast);
                } else {
                    handleError(resp.statusCode, apiResponse, message);
                }
            } catch (e) {
                console.error(e.message);
            }
        });
    });
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
            `
                .replace(/^[\t ]+/gm, "")
                .replace(/[\t ]+$/gm, "\n");
            break;
        case 500:
            errorMessage = resp.message;
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
    `
        .replace(/^[\t ]+/gm, "")
        .replace(/[\t ]+$/gm, "\n");
}
