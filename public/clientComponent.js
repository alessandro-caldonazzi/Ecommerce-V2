function Session() {
    var jwt = "";
    let config = {
        "refreshUrl": "/auth/refresh",
        "blacklist": {
            "enabled": true,
            "endpoit": "/blacklist"
        },
        "JwtKeyName": "jwt",
        "advancedSecurity": false
    };

    this.setConfig = (newConfig) => {
        config = newConfig;
    }
    this.fetch = async(url, option = {}) => {
        if (!option.headers) {
            option.headers = {};
        }
        if (config.advancedSecurity) {
            option.headers[config.JwtKeyName] = await getJwt();
        } else {
            option.headers[config.JwtKeyName] = jwt;
        }

        return await fetch(url, option);
    }

    var getJwt = () => {
        return new Promise((resolve, reject) => {
            console.log(config.refreshUrl)
            fetch(config.refreshUrl)
                .then(response => response.json())
                .then(data => {
                    resolve(data[config.JwtKeyName]);
                })
                .catch(err => reject(err));
        });
    }

    this.refresh = async() => {
        jwt = await getJwt();
        console.log(jwt)
    }

    this.blacklist = () => {
        if (config.blacklist.enabled) {
            this.fetch(config.blacklist.endpoit);
        }
    }
}