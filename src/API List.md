### API_1
( 1 time/ 2 second )
* input: none
* output:
```javascript
[
  {
    "time": timestamp,
    "floor": number(integer),
    "category": string,
    "message": string,
    "condition": number(integer)
  },
  {
    "time": "2021-05-23 13:40:06",
    "floor": 3,
    "category": "High",
    "message": "银行全空调箱故障跳脫",
    "condition": 1
  },
  ...
]
```

### API_2
* input:
```javascript
{
  "filterCondition": {
    "building": ??,
    "floor": number(integer),
    "category": string,
    "condition": number(integer)
  },
  "datetime": {
    "start": timestamp, 
    "end": timestamp
  }
}
```
* output:
```javascript
[
  {
    "time": timestamp,
    "floor": number(integer),
    "category": string,
    "message": string,
    "condition": number(integer)
  },
  {
    "time": "2021-05-23 13:40:06",
    "floor": 3,
    "category": "High",
    "message": "银行全空调箱故障跳脫",
    "condition": 1
  },
  ...
]
```

### API_3

* input:
  
  type: "month", "year"
```javascript
{
  "type": string,
  "value": timestamp
}
//example
// {
//   "type": "month",
//   "value": "2021/05"
// }
// {
//   "type": "year",
//   "value": "2021"
// }
```
* output:

  type = month => 0~5
  
  type = year => 0~1
```javascript
{
  "0": {
    "title": "2020/12", 
    "data": [
      {
        "time": timestamp,
        "floor": number(integer),
        "category": string,
        "message": string,
        "condition": number(integer)
      },
      {
        "time": "2020-12-26 12:09:28",
        "floor": 6,
        "category": "High",
        "message": "银行全空调箱故障跳脫",
        "condition": 2
      },
      {
        ...
      }
    ]
  },
  "1" {
    ...
  }
}
```

### API_4
sub url CRUD
* input:
    
  method: POST, GET, PUT, DELETE
```javascript
{id: number(integer)}
```

### API_5
(Logo for Read and Update)
* input:
  
  method: GET, PUT

  type: "homePage", "nav"
```javascript
// GET
{
  "type": string    
}

// PUT
{
  "type": string,
  "byteData": byte
}
```
* output:
```javascript
// GET
{
  "data": byte
}

// PUT
return 2XX
```
