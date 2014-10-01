var loader = (function () {
 

     function loadData( callBack ) {
        $.ajax({
            dataType: "json",
            url: DATA_URL,

            success: function(data) {
                //returned = $.csv.toObjects(data);
                callBack( data );
            },
            error: function (xhr, textStatus, errorThrown) {
              console.warn("error");
            }
        });
    }


    function setURL( url ) {
        console.log("LOADER:: set url: " + url);
          DATA_URL = url;
    }

        
    return{
      loadData:loadData,
      setUrl:setURL
    }
 

})();