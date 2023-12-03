# Non Containerized NSFS - Developer customization (OPTIONAL)

The following list consists of supported optional developer customization  -

## 1. Number of forks - 
 
**Description -** Adjust the number of forks in order to increase the S3 endpoints number. This will enable NooBaa  to handle a higher scale of S3 requests concurrently.

**Environemnt Variable -** ENDPOINT_FORKS

**Steps -**
```
1. Open the /etc/noobaa.conf.d/.env file.
2. Set the ENDPOINT_FORKS variable to the desired level.
Example:
ENDPOINT_FORKS=8
```

## 2. Log debug level -

**Description -** Set the debug level to control the amount of debugging information generated by the application.

Supported log debug levels:
1. default - for default debugging
2. warn - for only warning/errors debugging. 
3. nsfs - for more nsfs detailed debugging.
4. all - for all detailed debugging.


**Environemnt Variable -** NOOBAA_LOG_LEVEL

**Steps -**
```
1. Open the /etc/noobaa.conf.d/.env file.
2. Set the NOOBAA_LOG_LEVEL variable to the desired level.
Example:
NOOBAA_LOG_LEVEL=nsfs
```

## 3. Ports -

**Description -** Adjust the ports used by the application for communication

The following S3 endpoint ports can be customized:
1. ENDPOINT_PORT - S3 HTTP port 
2. ENDPOINT_SSL_PORT - S3 HTTPS port 
3. ENDPOINT_SSL_PORT_STS - STS HTTPS port 
4. EP_METRICS_SERVER_PORT - prometheus metrics port 


**Environemnt Variables -** ENDPOINT_PORT, ENDPOINT_SSL_PORT, ENDPOINT_SSL_PORT_STS, EP_METRICS_SERVER_PORT

**Steps -**
```
1. Open the /etc/noobaa.conf.d/.env file.
2. Set the environment variable.
Example:
ENDPOINT_PORT=5555
```

## 4. Allow http -
**Description -** Enable or disable HTTP support for your application. 

// TODO: step should move from system.json to config.json