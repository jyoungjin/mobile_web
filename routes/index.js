var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var User = require('../schemas/user');
var router = express.Router();


/* API를 접근을 위한 변수 선언 */
var url = ''
var KEY = '1wioZwfvwuSqAbnjJx1l7r%2F64HFDpCrm6qm2sotU8Ak2ev0%2B2XoariUH1fbOxEVUvkwM2opLzmI5B%2BonL%2F056Q%3D%3D';
var station = '';
var api_url = '';

var stationName = [],
    stationId = [];
var station = {
    stationName: stationName,
    stationId: stationId
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('default', {
        title: 'BIS'
    });
});

router.get('/busPath', function (req, res, next) {
    res.render('busPath', {
        title: 'busPath'
    });
});

router.get('/result', function (req, res, next) {

    /* x, y 좌표 받아오기 */
    let x = req.query.x;
    let y = req.query.y;


    //    stationName = [];
    //    stationId = [];

    /* 주변 정류소 목록 조회 */
    url = 'http://openapi.gbis.go.kr/ws/rest/busstationservice/searcharound';
    api_url = url + '?serviceKey=' + KEY + '&x=' + x + '&y=' + y;

    request(api_url, function (error, res, body) {
        let $ = cheerio.load(body);
        stationName = [];
        stationId = []
        let arr = $('response').children('msgBody').children('busStationAroundList');

        for (let i = 0; i < arr.length; i++) {
            stationName.push(arr[i].children[5].children[0].data);
            stationId.push(arr[i].children[4].children[0].data);

        }

        station = {
            stationName: stationName,
            stationId: stationId
        }
    })
    setTimeout(function () {
        //        console.log(station)
        res.render('result', {
            title: 'busPath',
            x: x,
            y: y,
            station: station,
        });
    }, 1000)


});

router.get('/searchId', async function (req, res, next) {
    let stations = [];

    let stationId = req.query.stationId;
    let stationName = '';
    console.log(station)

    station.stationId.forEach(function (item, index) {
        if (station.stationId[index] === stationId)
            stationName = station.stationName[index];
    })
    console.log('stationName = ' + stationName);
    url = 'http://openapi.gbis.go.kr/ws/rest';

    var queryParams = '/busarrivalservice/station?' + encodeURIComponent('serviceKey') + '=' + KEY;
    queryParams += '&' + encodeURIComponent('stationId') + '=' + stationId;
    api_url = url + queryParams;
    var loc_temp = [],
        loc2_temp = [],
        pre_temp = [],
        pre2_temp = [],
        idx_temp = [];

    var routeName = []
    var routeId = []

    var route = {
        routeId: routeId,
        routeName: routeName
    }

    var arrival = {
        locationNo1: loc_temp,
        locationNo2: loc2_temp,
        predictTime1: pre_temp,
        predictTime2: pre2_temp,
        index: idx_temp
    }

    request(api_url, function (err, res, body) {
        $ = cheerio.load(body);


        $('busArrivalList').each(function (idx) {
            let rid = $(this).find('routeId').text();

            let locationNo1 = $(this).find('locationNo1').text();
            let locationNo2 = $(this).find('locationNo2').text();
            let pTime = $(this).find('predictTime1').text();
            let pTime2 = $(this).find('predictTime2').text();

            route.routeId.forEach(function (e, index) {
                if (e === rid) {
                    /* 데이터 저장 
                       - idx : 몇번째 routeId인지 식별하기 위한 인덱스값
                       - loc : 해당 버스가 몇번째전 정류소인지
                       - pre : predictTime, 몇분 후 도착예정인지
                    */
                    idx_temp.push(index);
                    loc_temp.push(locationNo1);
                    loc2_temp.push(locationNo2);
                    pre_temp.push(pTime);
                    pre2_temp.push(pTime2);

                }

            })
        })
    })

    queryParams = '/busstationservice/route?' + encodeURIComponent('serviceKey') + '=' + KEY;
    queryParams += '&' + encodeURIComponent('stationId') + '=' + stationId;

    api_url = url + queryParams;


    request(api_url, function (err, res, body) {
        $ = cheerio.load(body);

        $('busRouteList').each(function (idx) {
            routeName.push($(this).find('routeName').text());
            routeId.push($(this).find('routeId').text());
        })
    })

    try {
        let users = await User.find();

        if (users == '') {
            res.send('일치하는 데이터가 없음');
        } else {
            for (let i = 0; i < users.length; i++) {
                let tName = users[i]._doc.tName;
                let tId = users[i]._doc.tId;
                stations.push({
                    'tName': tName,
                    'tId': tId
                });
            }
        }
    } catch (error) {
        console.error(err);
        next(err);
    };

    setTimeout(function () {
        res.render('searchId', {
            title: 'searchId',
            stations: stations,
            stationId: stationId,
            stationName: stationName,
            route: route,
            arrival: arrival,
        })
    }, 1000);

})


router.post('/searchId', async function (req, res) {
    console.log('post 진입');
    let stationId = req.body.inputNum;
    console.log(`stationId = ${stationId}`);

    try {
        let users = await User.find();

        if (users == '') {
            res.send('일치하는 데이터가 없음');
        } else {
            for (let i = 0; i < users.length; i++) {
                let tName = users[i]._doc.tName;
                let tId = users[i]._doc.tId;
                stations.push({
                    'tName': tName,
                    'tId': tId
                });
            }
        }
    } catch (error) {
        console.error(err);
        next(err);
    };

    res.render('searchId', {
        title: 'searchId',
        stationId: stationId
    })
})

router.get('/myPage', function (req, res, next) {
    res.render('myPage', {
        title: 'myPage'
    })
})



router.post('/form_receiver', async function (req, res) {
    // myPage에서 form_receiver로 tName, tId 값을 body 객체를 통해 전송받음
    var user = new User();
    // user객체를 생성 하여 post로 받아온 tName,tId값 저장
    user.tName = req.body.tName;
    user.tId = req.body.tId;

    // user객체를 Db에 저장
    user.save(function (err) {
        if (err) {
            console.error(err);
            return;
        }
    });
    // 저장이 완료되면 searchId 화면으로 이동
    res.redirect('/searchId');
});


router.get('/delone*', async function (req, res, next) {
    var ttId = req.query.tId;
    // bookmark에서 parameter로 tid값을 url을 통해 넘겨주고 ttid에 저장
    // url을 통해 넘어온 tid값에 해당하는 DB정보를 삭제
    await User.deleteOne({
        tId: ttId
    });
    console.log(ttId);
    // 삭제가 완료되면 searchId 화면으로 이동
    res.redirect('/searchId')
});

router.get('/insert*', async function (req, res, next) {
    // result_content에서 즐겨찾기 등록시 tName, tID값을 url을 통해 전송
    //user객체를 생성 하여 get로 받아온 tName,tId값 저장
    var user = new User();
    user.tId = req.query.tId;
    user.tName = req.query.tName;

    console.log(user.tId);
    console.log(user.tName);
    user.save(function (err) {
        if (err) {
            console.error(err);
            return;
        }
    });
    // 저장이 완료되면 searchId 화면으로 이동
    res.redirect('/searchId')
});


module.exports = router;
