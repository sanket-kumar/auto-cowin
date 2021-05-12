Auto Cowin


node autoSlot.js <district_id_comma_separated> <auth_token>


Fetch States:

curl --location --request GET 'https://cdn-api.co-vin.in/api/v2/admin/location/states' \
--header 'accept: application/json' \
--header 'Accept-Language: hi_IN'

Fetch Districts:

curl --location --request GET 'https://cdn-api.co-vin.in/api/v2/admin/location/districts/9' \
--header 'accept: application/json' \
--header 'Accept-Language: hi_IN'

Auth token generated after logging in on browser in response of OTP 
