exports.run = function (client, message, args) {
    // const superagent = require('superagent');
    // const { http, https } = require('follow-redirects');

    // const request = https.request({
    //     host: 'sci-hub.scihubtw.tw',
    //     path: 'https://www.doi.org/10.2307/1342499/',
    // }, response => {
    //     console.log(response.responseUrl);
    //     superagent
    //         .get(response.responseUrl)
    //         .end((err, res) => {
    //             console.log(res.text)
    //             var found = res.text.match(/<iframe src=\"(.*?)\" id=\"pdf\"><\/iframe>/)
    //             console.log(found)
    //         })
    // });
    // request.end();
    // var axios = require('axios');

    // var config = {
    //     method: 'get',
    //     url: 'https://sci-hub.scihubtw.tw/10.2307/1342499/',
    //     headers: {
    //         'Cookie': '__ddg1=ocdvvrbV1P2O1HIBm71C'
    //     }
    // };

    // axios(config)
    //     .then(function (response) {
    //         console.log((response.data));
    //         // var found = response.data.match(/<iframe src=\"(.*?)\" id=\"pdf\"><\/iframe>/)
    //         // console.log(found)
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //     });

}