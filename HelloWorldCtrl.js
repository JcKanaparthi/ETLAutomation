angular.module("app", []).controller("HelloWorldCtrl", function($scope) {  
    $scope.message="Hello World" ;

    $scope.jsonText = [];

    $(document).ready(function(){
          $("#fileUploader").change(function(evt){
                var selectedFile = evt.target.files[0];
                var reader = new FileReader();
                reader.onload = function(event) {
                  var data = event.target.result;
                  var workbook = XLSX.read(data, {
                      type: 'binary'
                  });
                  workbook.SheetNames.forEach(function(sheetName) {
                    
                      var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

                      

                      var json_object = JSON.stringify(XL_row_object);
                      //document.getElementById("jsonObject").innerHTML = json_object;
                        

                        $scope.$apply(function (scope) {

                            $scope.jsonText = XL_row_object;
                            
                        });

                        console.log("XL_row_object");
                        console.log(XL_row_object);
                        console.log("json_object");
                        console.log(json_object);


                    })
                };

                reader.onerror = function(event) {
                  console.error("File could not be read! Code " + event.target.error.code);
                };

                reader.readAsBinaryString(selectedFile);
          });
    });
} )