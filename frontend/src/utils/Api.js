class Api {
    constructor(config) {
        this.url = config.url;
        this.headers = config.headers;
    }

    getCardsInfo() {
        return fetch(`${this.url}/cards`, {
            credentials: 'include',
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    createCard({ name, link }) {
        return fetch(`${this.url}/cards`, {
            method: 'POST',
            credentials: 'include',
            headers: this.headers,
            body: JSON.stringify({
                "name": name,
                "link": link
            })
        })
            .then(this._checkResponse)
    }

    getUserInfo() {
        return fetch(`${this.url}/users/me`, {
            credentials: 'include',
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    patchUserInfo({ name, about }) {
        return fetch(`${this.url}/users/me`, {
            method: 'PATCH',
            credentials: 'include',
            headers: this.headers,
            body: JSON.stringify({
                "name": name,
                "about": about
            })
        })
            .then(this._checkResponse)
    }

    patchAvatar({ avatar }) {
        return fetch(`${this.url}/users/me/avatar`, {
            method: 'PATCH',
            credentials: 'include',
            headers: this.headers,
            body: JSON.stringify({
                "avatar": avatar
            })
        })
            .then(this._checkResponse)
    }

    putLike(id) {
        return fetch(`${this.url}/cards/${id}/likes`, {
            method: 'PUT',
            credentials: 'include',
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    deleteLike(id) {
        return fetch(`${this.url}/cards/${id}/likes`, {
            method: 'DELETE',
            credentials: 'include',
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    deleteCard(id) {
        return fetch(`${this.url}/cards/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    logout() {
        return fetch(`${this.url}/logout`, {
            method: 'DELETE',
            credentials: 'include',
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    _checkResponse(res) {
        if (res.ok) {
            return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
    }

}


export const api = new Api({
    url: "https://api.mesto.student.project.nomoredomains.xyz",
    headers: {
        'content-type': 'application/json'
    }
})