import pymongo
from datetime import date

from pymongo import MongoClient
import statistics

import pickle
import numpy as np
import xlwt
from xlwt import Workbook

#connect to database
today = date.today()
connection = MongoClient('localhost',27017)
db=connection.hospitalDB

data = db.paitents

BloodPresureData = data.find()
name=[]
bloodPressureData = {}
d1 = today.strftime("%d/%m/%Y")
bloodPressureData["date"]=d1
for item in BloodPresureData:
    name.append(item["name"])
    bloodPressureData[item["name"]] = item['bloodPressureCount']


print(bloodPressureData)

with open('BParray.pickle', 'wb') as handle:
    pickle.dump(bloodPressureData, handle, protocol=pickle.HIGHEST_PROTOCOL)

wb = Workbook()
sheet1 = wb.add_sheet('Sheet 1')

sheet1.write(0, 0, 'Date')
l=1
sheet1.write(1, 0, d1)

for i in name:
    bp=[]
    for j in bloodPressureData[i]:
        print(j)
        bp.append(j)
    sheet1.write(0, l, i)
    sheet1.write(1, l, statistics.mean(bp)  # 20.11111111111111
)
    l=l+1



wb.save('xlwt example.csv')