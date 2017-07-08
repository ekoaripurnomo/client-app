# App Client
* open start.spring.io
	```txt
	Gradle project, SpringBoot 1.5.3
	Group = id.co.hanoman.training.client.app	
	Artifact = client-app
	dependencies = Web
	```
* create implicit-client.html di folder static
	
	```html
	<!DOCTYPE html>
	<html>
	<head>
	<meta charset="UTF-8" />
	<title>OAuth2 Client Implicit</title>
	</head>
	<body>
			<h1>OAuth Client Implicit</h1>		
		
	</body>
	</html>	
	```
 
* edit aplication.properties
	
	```txt
	server.port = 7070
	server.context_path = /implicit
	spring.jackson.serialization.INDENT_OUTPUT=true
	project.base-dir=file:///D:/Data/Belajar/Java/spring-boot-latihan-app-client-implicit
	spring.thymeleaf.prefix=${project.base-dir}/src/main/resources/templates/
	spring.thymeleaf.cache=false
	spring.resources.static-locations=${project.base-dir}/src/main/resources/static/
	spring.resources.cache-period=0
	```
	
* jalankan gradle bootRun ; buka http://localhost:7070/implicit/implicit-client.html
	harus sudah jalan halaman html nya
* open http://angularjs.org/
	klik download, jus copy CDN
	add <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script> ke implicit-client.html sebelum end tag </body>	
* buat folder js di static lalu buat file app.js
	add <script src="js/app.js"></script> ke implicit-client.html sebelum end tag </body>
* create ng-app="oauthClient" di tag body <body ng-app="oauthClient">
* create ng-controller="DemoController" pada area div setelah tag <body> -> <div ng-controller="DemoController">
	dengan contoh sbb:
	
	```html
	...
	<body ng-app="oauthClient">
		<div ng-controller="DemoController">
			<h1>OAuth Client Implicit</h1>		
			
		
		</div>
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script>
		<script src="js/app.js"></script>
	</body>
	</html>
	```

* edit app.js
	
	```js
	var aplikasi = angular.module('oauthClient', []);

	aplikasi.controller('DemoController', function($scope){
		
	});
	```
	
* gunakan script ini pada implicit-client.html file untuk menguji bahwa angularjs sudah jalan 
	
	```html
	Nama : <input type="text" ng-model="nama">
		<br>
		Nama : {{nama}}
	```
	
* edit script app.js untuk check response script dengan result "test"
	
	```js
	aplikasi.controller('DemoController', function($scope){
		$scope.requestKeResourceServer = function(){
			$scope.responseDariServer = "test";
		};
	});
	```
	
* edit implicit-client.html
	
	```html
	<hr>
	
		<button ng-click="requestKeResourceServer()">Request ke Resource Server</button>
		<div>
			{{responseDariServer}}
		</div>
	```
	
* edit script app.js
	
	```js
	var aplikasi = angular.module('oauthClient', []);

	aplikasi.controller('DemoController', function($http, $scope){
		var serverUrl = "http://localhost:8080/api/alamat";
		$scope.requestKeResourceServer = function(){
			$http.get(serverUrl).then(
				function(response){
					$scope.responseDariServer = response.data;
				},
				function(response){
					alert('Error code : '+response.status+', Error text : '+response.statusText);
				}
			);
				
		};
	});
	```
	
* ada error karena masalah di cors, maksudnya antara app client dan resource server jalan di server yang berbeda
	tambahakan anotation @CrossOrigin ke @RestController dalam hal ini AlamatController.java
	
	```java
	@RestController 
	@CrossOrigin
	```
	
*  add <button ng-click="bukaLoginPage()">Login ke Server</button> ke implicit-client.html utk button authorize
*  create script authorize nya di app.js
	
	```js
	aplikasi.controller('DemoController', function($http, $scope, $window){
		
		var authServerUrl = "http://localhost:10000/oauth/authorize?client_id=hciimp&response_type=token";
	
		$scope.bukaLoginPage = function(){
			$window.location.href = authServerUrl;
		};
	```
	
* edit method configure(ClientDetailsServiceConfigurer clients) pada OAuth2Configuration.java di project auth-server pada bagian implicit
	tambahkan redirectUris dan autoApprove
	
	```java
	.and().withClient("hciimp")
		.secret("hciimp123")
		.authorizedGrantTypes("implicit")
		.scopes("alamat")
		.authorities("Operator")
		.redirectUris("http://localhost:7070/implicit/implicit-client.html")
		.accessTokenValiditySeconds(600)
	.autoApprove(true);
	```
	
	
* add <button ng-click="ambilTokenDariUrl()">Ambil Token dari Url</button> ke implicit-client.html utk button get token


*  create script get token nya di app.js
	
	```js
	aplikasi.controller('DemoController', function($http, $scope, $window, $location){
		
		$scope.ambilTokenDariUrl = function(){
			var location = $location.url();
			console.log("Location : "+location);
			var params = location.split("&");
			console.log(params);
			var tokenParam = params[0];
			$scope.token = tokenParam.split("=")[1];
			console.log("Token : "+$scope.token);
		};
	```
	
* create script berikut untuk ambil data json di implicit-client.html
	
	```html
	<button ng-click="requestKeResourceServer()">Request ke Resource Server</button>
		<div>
			{{responseDariServer}}
		</div>
	```
	
* create script requestKeResourceServer di app.js
	
	```js
	aplikasi.controller('DemoController', function($http, $scope, $window, $location){
	
	var resourceServerUrl = "http://localhost:8080/api/alamat";
	
		$scope.requestKeResourceServer = function(){
		
			if(!$scope.token){
				alert('Belum login, silahkan login terlebih dahulu atau token belum di ambil');
				return;
			} 		
			$http.get(resourceServerUrl+"?access_token="+$scope.token).then(
				function(response){
					$scope.responseDariServer = response.data;
				},
				function(response){
					alert('Error code : '+response.status+', Error text : '+response.statusText);
				}
			);
				
		};
	```
	
* untuk menyimpan token ke session localstorage lakukan perubahan di app.js pada script berikut
	
	```js
	$scope.ambilTokenDariUrl = function(){
		var location = $location.url();
		console.log("Location : "+location);
		var params = location.split("&");
		console.log(params);
		var tokenParam = params[0];
		var token = tokenParam.split("=")[1];   <------------
		console.log("Token : "+token); <------------
		$window.sessionStorage.setItem('token', token); <------------
	};
	
	$scope.requestKeResourceServer = function(){
		
		var token = $window.sessionStorage.getItem('token'); <------------
		
		console.log("Tokend : "+token); <------------
		
		if(!token){ <------------
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
	```
	
* mengeluarkan output json dalam bentuk table html
	
	```html
	<table border="1">
		<thead>
			<tr>
				<th>Jalan</th>
				<th>Kota</th>
				<th>Propinsi</th>
				<th>Kode Pos</th>
				<th>&nbsp;</th>
			</tr>
		</thead>
		<tbody>
			<tr ng-repeat="a in dataAlamat.content">
				<td>{{a.jalan}}</td>	
				<td>{{a.kota}}</td>
				<td>{{a.propinsi}}</td>	
				<td>{{a.kodepos}}</td>
				<td><button ng-click="hapusAlamat(a)">hapus</button></td>				
			</tr>
		</tbody>	
	</table>
	```
	
* create alamat.html di folder src/main/resources/static/
	
	```html
	<!DOCTYPE html>
	<html>
	<head>
	<meta charset="UTF-8" />
	<title>Alamat Alamat</title>
	</head>
	<body ng-app="oauthClient">
		<h1>Daftar Alamat</h1>
		<div ng-controller="DemoController">
			<table border="1">
				<thead>
					<tr>
						<th>Jalan</th>
						<th>Kota</th>
						<th>Propinsi</th>
						<th>Kode Pos</th>
						<!-- <th>&nbsp;</th> -->
					</tr>
				</thead>
				<tbody>
					<tr ng-repeat="a in dataAlamat.content">
						<td>{{a.jalan}}</td>	
						<td>{{a.kota}}</td>
						<td>{{a.propinsi}}</td>	
						<td>{{a.kodepos}}</td>
						<!-- <td><button ng-click="hapusAlamat(a)">hapus</button></td> -->				
					</tr>
				</tbody>	
			</table>
		</div>
		
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script>
		<script src="js/app.js"></script>
	</body>
	</html>
	```

* cara menguji
	open di browser http://localhost:7070/implicit/implicit-client.html<br />
	jika belum di klik login maka preview table html dari alamat tidak muncul<br />
	klik Login ke Server akan di bawa kehalaman login, lalu login dan kembali lagi ke halaman semula<br />
	klik Ambil token dari Url guna menyimpan token di sessionStorage<br />
	klik Request ke Resources Server untuk mendapat API format JSON dan table<br />
	Jika pada durasi waktu session, ketika url di ubah ke http://localhost:7070/implicit/alamat.html maka masih menghasilkan alamat table html dengan syarat session browser yang sama.