angular.module("app", []).controller("HelloWorldCtrl", function($scope) {  
    $scope.message="Hello World" ;

    $scope.jsonText = [];

    $scope.requiredData = {
      database: [],
      table: [],
      columns: [],
      aliasColums: []
    };

    $scope.selectedData = {
      transformation: "",
      database: "",
      table: "",
      columns: []
    };
    $scope.SourceColumnNames = [];
    $scope.toggleSelection = function toggleSelection(column) {
      var idx = $scope.selectedData.columns.indexOf(column);
      if (idx > -1) {
        // is currently selected
        $scope.selectedData.columns.splice(idx, 1);
       }
       else {
         // is newly selected
         $scope.selectedData.columns.push(column);
       }
    };

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
                    if(sheetName == "RLM Commitment PS"){
                      var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

                      

                      var json_object = JSON.stringify(XL_row_object);
                      //document.getElementById("jsonObject").innerHTML = json_object;
                        

                        $scope.$apply(function (scope) {

                            $scope.jsonText = XL_row_object;

                            $scope.jsonText.forEach(function(item, index){

                              item.SourceDatabase_DataReport_Array = [];
                              item.SourceDatabase_DataReport_Array = item.SourceDatabase_DataExtract_Report.split(" ");
                              item.SourceDatabase_DataReport_Selected = "";
                              if(item.SourceDatabase_DataReport_Array){
                                item.SourceDatabase_DataReport_Selected = item.SourceDatabase_DataReport_Array[0];
                              }

                              item.SourceDatabase_DataReport_Array.forEach(function(database, databaseIndex){
                                $scope.requiredData.database.push(database);
                              })

                              item.Source_TableName_Array = [];
                              item.Source_TableName_Array = item.SourceTable_View_File_Segment.split(" ");
                              item.Source_TableName_Selected = "";
                              if(item.Source_TableName_Array){
                                item.Source_TableName_Selected = item.Source_TableName_Array[0];
                              }

                              item.Source_TableName_Array.forEach(function(table, tableIndex){
                                $scope.requiredData.table.push(table);
                              })

                              item.Source_ColumnNAme_Array = [];
                              item.Source_ColumnNAme_Array = item.SourceColumn_Field.split(" ");
                              
                              item.Source_ColumnNAme_Selected = "";
                              if(item.Source_ColumnNAme_Array){
                                console.log("source names start");
                                console.log($scope.SourceColumnNames);
                                console.log("source names End");
                                item.Source_ColumnNAme_Array.forEach(function(colName,Idx){
                                  $scope.SourceColumnNames.push(colName);

                                })
                                
                                item.Source_ColumnNAme_Selected = item.Source_ColumnNAme_Array[0];
                              }

                              item.Source_ColumnNAme_Array.forEach(function(column, columnIndex){
                                $scope.requiredData.columns.push(column);
                              })

                              item.tgt_co_name_Array = [];
                              item.tgt_co_name_Array = item.Target_Column_Field.split(" ");
                              item.tgt_co_name_Selected = "";
                              if(item.tgt_co_name_Array){
                                item.tgt_co_name_Selected = item.tgt_co_name_Array[0];
                              }

                              item.tgt_co_name_Array.forEach(function(column, columnIndex){
                                $scope.requiredData.aliasColums.push(column);
                                
                                $scope.requiredData.aliasColums = $scope.requiredData.aliasColums.filter(onlyUnique);
                              })
    
                              console.log(item);


                              if(item.Transformation_Rule && item.Transformation_Rule.toUpperCase() == "STRAIGHT MOVE"){
                                var straightmove = item.SourceColumn_Field + " AS " + item.Target_Column_Field;
                                
                                $scope.straightMoveStatement.push(straightmove);
                              }

                              if(item.Transformation_Rule && item.Transformation_Rule.toUpperCase().indexOf("DEFAULT") > -1){
                                var defaultState = item.Transformation_Rule.replace('Default to', '');
                                defaultState = defaultState.replace('Default', '');
                                defaultState = defaultState + " AS " + item.Target_Column_Field;

                                $scope.defaultStatements.push(defaultState);
                              }


                            })

                            
                        });



                    }
                    })
                };

                reader.onerror = function(event) {
                  console.error("File could not be read! Code " + event.target.error.code);
                };

                reader.readAsBinaryString(selectedFile);
          });
    });


    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }


    $scope.transformations = [
      {
        name: "BASE_TABLE"
      },
      {
        name: "CONCAT"
      },
      {
        name: "CASE_STATEMENT"
      },
      {
        name: "SUBSTRING"
      },
      {
        name: "JOIN"
      },
      {
        name: "AGGREGATE FUNCTIONS"
      }
    ];

    $scope.baseTable = "";

//BaseTable
      $scope.baseTable = {
        name:""
      };
//BaseTable

//DefaultStatement
      $scope.defaultStatements = [];
//DefaultStatement

//StraightMove
      $scope.straightMoveStatement = [];
//StraightMove


//CaseStatement
    $scope.caseconditions = [
      {
        name: " IS NULL "
      },
      {
        name: " IS NOT NULL "
      }
    ]

    $scope.caseParams = {
      sourceColumn: "",
      condition: "",
      targetColumn: "",
      elseColumn: "",
      aliasColums: ""
    };

    $scope.caseStatements = [];

    $scope.getCaseStatement = function(){
      var caseStatement = " CASE WHEN " + $scope.caseParams.sourceColumn + " " + 
      $scope.caseParams.condition.name + " THEN " + $scope.caseParams.targetColumn + " ELSE " + 
      $scope.caseParams.elseColumn + " END AS " + $scope.caseParams.aliasColums;

      $scope.caseStatements.push(caseStatement);

    }
//CaseStatement

//JoinStatement
    $scope.joins = [
      {
        name: " INNER JOIN "
      },
      {
        name: " LEFT OUTER JOIN "
      },
      {
        name: " RIGHT OUTER JOIN "
      },
      {
        name: " FULL OUTER JOIN "
      }
    ]

    $scope.aggregateFunctions = [
      {
        name: "MAX"
      },
      {
        name: "MIN"
      },
      {
        name: "SUM"
      },
      {
        name: "AVG"
      }
    ]

    $scope.joinParams = {
      joinType: "",      
      joinTable: "",
      fromColumn: "",
      toColumn: ""
    };

    $scope.aggregateParams = {
      aggregateType: "",      
      aggregateTable: "",
      fromColumn: "",
      toColumn: ""
    };

    $scope.joinStatements = [];

    $scope.getJoinStatements = function(){
      var joinStatement = $scope.joinParams.joinType.name + " " + $scope.joinParams.joinTable + " ON " +
      $scope.joinParams.fromColumn + " = " + $scope.joinParams.toColumn;

      $scope.joinStatements.push(joinStatement);
    }
//JoinStatement

// ConcatStatement

$scope.concatStatement = [];

$scope.concatStatementArray = [];    
    $scope.concat = {
      sourceColumNAme : ""
    }
    $scope.concatStatementArray.push($scope.concat);

    $scope.getConcatStatements = function(){
      var concatStatementString = "";
      $scope.concatStatementArray.forEach(function(item, index){
        concatStatementString += item.sourceColumNAme
        if($scope.concatStatementArray.length != (index+1)){
          concatStatementString += " || "
        }
      })

      $scope.concatStatement.push(concatStatementString);
    }

// ConcatStatement

// SubStringStatement

    $scope.substringStatement = [];

    $scope.substringStatementArray = [];    
    $scope.substring = {
      substringColumNAme : "",
      substringStart: 0,
      substringLength: 0,
      substringAlias: ""
    }
    $scope.substringStatementArray.push($scope.substring);

    $scope.getSubstringStatements = function(){
      var substringStatementString = "";
      $scope.substringStatementArray.forEach(function(item, index){
        substringStatementString += "SUBSTRING" + "(" + item.substringColumNAme + ","+item.substringStart + ","+item.substringLength + ")" + " " + "AS" + " " + item.substringAlias;
        
      })

      $scope.substringStatement.push(substringStatementString);
    }

// SubStringStatement


// aggregateStatement

$scope.aggregateStatement = [];

$scope.aggregateStatementArray = [];    
$scope.aggregate = {
  aggregateType : "",
  aggregateColumn: "",
  aggregateTargetName: ""
  
}
$scope.aggregateStatementArray.push($scope.aggregate);

$scope.getAggregateStatements = function(){
  var aggregateStatementString = "";
  $scope.aggregateStatementArray.forEach(function(item, index){
    aggregateStatementString += item.aggregateType+"("+item.aggregateColumn+")"+ " " + "AS" + " " + item.aggregateTargetName;
    
  })

  $scope.aggregateStatement.push(aggregateStatementString);
}

// aggregateStatement

    $scope.query = "";
    $scope.createQuery = function(){
      $scope.query = "SELECT ";
      
      $scope.straightMoveStatement.forEach(function(item, index){
        $scope.query += item + ", "
      })

      $scope.defaultStatements.forEach(function(item, index){
        $scope.query += item + ", "
      })

      $scope.concatStatement.forEach(function(item, index){
        $scope.query += item + ", "
      })

      $scope.caseStatements.forEach(function(item, index){
        $scope.query += item + ", "
      })

      $scope.substringStatement.forEach(function(item, index){
        $scope.query += item + ", "
      })
      $scope.aggregateStatement.forEach(function(item, index){
        $scope.query += item + ", "
      })
      
     
      // var substringlength = $scope.substringStatement.length;
      // $scope.substringStatement.forEach(function(item, index){
      //   if((substringlength -1) == index ){
      //     $scope.query += item;
      //   }else{
      //     $scope.query += item + ", ";
      //   }
        
      // })
      $scope.query = $scope.query.slice(0, -2);
      $scope.query += " FROM " + $scope.baseTable.name
      
      $scope.joinStatements.forEach(function(item, index){
        $scope.query += " " + item + " ";
      })


    };

    
    $scope.autofillProduct = function (prodName,index, fieldType) {
      var output = [];
      var output1 = [];
      if (prodName && prodName != '' && prodName.length > 0) {
          prodName = String(prodName).toUpperCase();
          console.log("source names start");
          console.log($scope.SourceColumnNames);
          console.log("source names End");
          output = $scope.SourceColumnNames.filter(function (product) {
              if (fieldType == 'COLUMN_NAME') {
                  return (String(product).toUpperCase().includes(prodName) == true);
              }else if(fieldType == 'SUB_STRING'){
                return (String(product).toUpperCase().includes(prodName) == true);
              }else if(fieldType == 'AGGREGATE'){
                return (String(product).toUpperCase().includes(prodName) == true);
              }
             
          });
      }
      if (fieldType == 'COLUMN_NAME') {
        $scope["filterProducts_" + index] = output;
      }else if(fieldType == 'SUB_STRING'){
        $scope["filterSubString_" + index] = output;
      }else if(fieldType == 'AGGREGATE'){
        $scope["filterAggregate_" + index] = output;
      }
     
    };

  $scope.fillTextbox = function (selProd,index,fieldType) {
    if(fieldType == 'COLUMN_NAME'){
      $scope.concatStatementArray[index].sourceColumNAme = selProd;
    }else if(fieldType == 'SUB_STRING'){
      $scope.substringStatementArray[index].substringColumNAme = selProd;
    }else if(fieldType == 'AGGREGATE'){
      $scope.aggregateStatementArray[index].aggregateColumn = selProd;
    }
    
    $scope['filterProducts_' + index] = null;
    $scope['filterSubString_' + index] = null;
    $scope['filterAggregate_' + index] = null;
  }

  $scope.addConcat = function(){
    let concat = {
      sourceColumNAme : ""
    }
    $scope.concatStatementArray.push(concat);
  }

  $scope.addSubstring = function(){
    let substring = {
      substringColumNAme : "",
      substringStart: 0,
      substringLength: 0,
      substringAlias: ""
    }
    $scope.substringStatementArray.push(substring);
  }


  $scope.activity = true;
  $scope.activityToggle = function(){
    $scope.activity = !$scope.activity;
  }


} )