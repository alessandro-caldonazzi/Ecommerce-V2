var stripe = Stripe('pk_test_51H02mCIzdogCmLgsgLyf9ISK12ITALwDkT9z9oWJaKBmImVr8vcgNOt5Gq3jBjvUZsKO8M49I8tDySne5RecLBSp00xbjkHLpA');

(async() => {
    await window.session.refresh();
    let data = {
        'orderID': 139
    }

    session.fetch('/payment/new', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        })
        .then(response => response.json())
        .then(data => pay(data['session_id']));
})()

async function pay(sessionID) {
    stripe.redirectToCheckout({
        // Make the id field from the Checkout Session creation API response
        // available to this file, so you can provide it as argument here
        // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
        sessionId: sessionID
    })
}