define(['../../utils/constant', '../../utils/utils'], function (constant, utils) {
    /**
     * A module representing a User controller.
     * @exports controllers/User
     */
    var Controller = function ($scope, CfgService, FileUploader) {

        function getCfgTypes() {
            CfgService.getAllCfgTypes().$promise.then(function(res) {
                var cfgTypes = res.data;
                var cfgTypesArray = [];
                cfgTypesArray.push({code:'请选择'})
                for(var prop in cfgTypes) {
                    cfgTypesArray.push({id:prop, code:cfgTypes[prop]});
                }
                utils.generatorDropdown($scope, 'cfgTypesDropdown', cfgTypesArray, cfgTypesArray[0]);
            });
        }
        getCfgTypes();

        $scope.queryConfig = function () {
            var params = $scope.cfgQuery;
            if (!params) {
                params = {};
            }
            if($scope.cfgTypesDropdown && $scope.cfgTypesDropdown.option) {
                params.cfgTypeId = $scope.cfgTypesDropdown.option.id;
            }
            params.pageNumber = 0;
            params.pageSize = 5000;

            $scope.cfgs = [];
            $scope.cfgsLoading = constant.loading;

            CfgService.queryConfig(params, function (res) {
                var result = res.data;
                if(res.info) {
                    $scope.cfgsLoading = constant.loadError;
                    return;
                }
                if(!result) {
                    $scope.cfgsLoading = constant.loadEmpty;
                    return;
                }

                $scope.cfgsLoading = '';
                $scope.cfgs = result.data;

            }, function () {
                $scope.cfgs = [];
                $scope.cfgsLoading = constant.loadError;
            });
        };

        $scope.queryConfig();
        $scope.download = function(cfg) {
            return constant.apiBase + "/cfg/download/" + cfg.cfgKey;
        }

        var uploader = $scope.uploader = new FileUploader({
            url: constant.apiBase + "/cfg/add-or-update",
            autoUpload: true,
            removeAfterUpload: true
        });

        var strs = ['id', 'cfgKey', 'cfgTypeId'];
        uploader.onAfterAddingFile = function(fileItem) {
            for(var index in strs) {
                var str = strs[index];
                var obj = {};
                obj[str] = fileItem[str];
                fileItem.formData.push(obj);
            }
            var valueObj = {};
            valueObj['value'] = fileItem.file.name;
            fileItem.formData.push(valueObj);
        };
    };

    return {
        name: "CfgController",
        fn: ["$scope", "CfgService", "FileUploader", Controller]
    };

});