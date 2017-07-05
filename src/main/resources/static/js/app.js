var aplikasi = angular.module('oauthClient', []);

aplikasi.controller('DemoController', function($http, $scope, $window, $location){
	var resourceServerUrl = "http://localhost:8080/api/alamat";
	var authServerUrl = "http://localhost:10000/oauth/authorize?client_id=hciimp&response_type=token";
	
	$scope.dataAlamat = {};
	
	$scope.bukaLoginPage = function(){
		$window.location.href = authServerUrl;
	};	
	$scope.ambilTokenDariUrl = function(){
		var location = $location.url();
		console.log("Location : "+location);
		var params = location.split("&");
		console.log(params);
		var tokenParam = params[0];
		var token = tokenParam.split("=")[1];
		console.log("Token : "+token);
		$window.sessionStorage.setItem('token', token);
	};	
	$scope.requestKeResourceServer = function(){
		
		var token = $window.sessionStorage.getItem('token');
		console.log("Token : "+token);
		
		if(!token){
			alert('Belum login, silahkan login terlebih dahulu atau token belum di ambil');
			return;
		} 		
		$http.get(resourceServerUrl+"?access_token="+token).then(
			function(response){
				$scope.responseDariServer = response.data;
			},
			function(response){
				alert('Error code : '+response.status+', Error text : '+response.statusText);
			}
		);
			
	};
	
	$scope.updateDataAlamat = function(){
		var token = $window.sessionStorage.getItem('token');
		if(!token){
			alert('Belum login, silahkan login terlebih dahulu atau token belum di ambil');
			return;
		} 
		$http.get(resourceServerUrl+"?access_token="+token).then(sukses, gagal);
		function sukses (response){
			$scope.dataAlamat = response.data;
			console.log(response);
		};
		function gagal (response){
			console.log(response);
			alert('Error = '+ response);
		};
	};
	$scope.updateDataAlamat();
});	

	
