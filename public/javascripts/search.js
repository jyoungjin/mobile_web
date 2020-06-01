$(function () {
    let new_href = '/searchId?stationId='

    console.log("확인")
    /*    $('#searchNum').click(function () {
            new_href += $(this).attr('stationId');
            console.log('작동중')
            console.log(new_href)
            //        $(this).attr('href', new_href);

        })*/

    $('#list tr td').on("click", "a", function () {
        
        let param = $(this).attr('stationId')
        let url = new_href + param;
        $(this).attr('href', url);
        
    })


})
