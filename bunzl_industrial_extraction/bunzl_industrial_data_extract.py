from tabula import read_pdf, read_pdf_with_template
import os
import glob
import sys

import pandas as pd
import numpy
from pymongo import MongoClient

def insert_to_mongo(df):
    '''
    {
        _id: Customer Product, (2)
        customer: Customer, (0)
        name: name, (1)
        Sig_prod: Signode Product, (3)
        desc: Descrip, (4)
        category: Category (5)
    }
    '''
    cluster = MongoClient("mongodb://127.0.0.1:27017/")
    db = cluster["signode"]
    collection_GF_EDI = db["BunzulProductCrossReference"]

    ret_list = []
    cols = df.columns.tolist()
    values_lst = df.values.tolist()
    for val in values_lst:
        query = {
            "_id": val[2],
            "customer": val[0],
            "name": val[1],
            "sig_prod": val[3],
            "desc": val[4],
            "category": val[5]
        }
        ret_list.append(query)
        collection_GF_EDI.insert_one(query)
    return len(ret_list)


def db_find_one(id):
    cluster = MongoClient("mongodb://127.0.0.1:27017/")
    db = cluster["signode"]
    collection_GF_EDI = db["BunzulProductCrossReference"]
    return collection_GF_EDI.find_one({"_id": id})


def list_of_files(path, file_ending='*.pdf'):
    '''
    path = directory of files
    file_ending = type of files (default = ".pdf")
    '''
    return glob.glob(os.path.join(path, file_ending))

def enter_directory(path):
    '''
    path = directory to enter(must be r'str')
    '''
    try: 
        os.chdir(path)
    except OSError:       
        print("Entering the directory %s failed" % path)

def move_files(src, dst):
    '''
    src = path to file (.pdf)
    dst = new path to file (.pdf)
    '''
    try:
        os.replace(src, dst)
    except:
        os.rename(src, dst)



def GENERAL_data(file, area=(215.3475, 42.4575, 666.6975, 147.2625) , pages=1):
    '''
    file: source file (type: .pdf)
    pages: 1, 2, .. 1-2,   "all"
    return PP first column data (type: .json)
    
    area (line items) => area = (215.3475, 42.075, 668.2275, 127.755) (default)
    area (ship Via) => area = (665.3007518796992, 42.94736842105263, 741.2255639097745, 406.4661654135338)
    '''
    
    json_data = read_pdf(file, pages=f"{pages}", area=area, stream=True, output_format="json")
    rows_data = json_data[0]["data"]
    rows_text = [row[0]["text"] for row in rows_data]
    return rows_text


def GF_data(file, area=(278.0775, 0.3825, 724.0725, 187.8075) , pages=1):
    '''
    file: source file (type: .pdf)
    pages: 1, 2, .. 1-2,   "all"
    return PP first column data (type: .json)
    
    area (line items) => area = (215.3475, 42.075, 668.2275, 127.755) (default)
    area (ship Via) => area = (665.3007518796992, 42.94736842105263, 741.2255639097745, 406.4661654135338)
    '''
    
    json_data = read_pdf(file, pages=f"{pages}", area=area, stream=True, output_format="json")
    rows_data = json_data[0]["data"]
    rows_text = [[row[0]["text"], row[1]["text"]] for row in rows_data]
    return rows_text
    

def ret_index(data):
    '''
    data (type: []): first column of the table
    return (type: int): return index of the po_no
    
    item list starts at ret_index(data)+2
    '''
    if 'quantity' in data[0][0].lower() or 'stock' in data[0][1].lower():
        if "---" in data[1][0].lower():
            return 2
        return 1
    elif "---" in data[0][0].lower():
        return 1
    return 0



def get_only_line_items(rows):
    rows = rows[ret_index(rows):]
    ret_arr = []
    temp = []
    for row in rows:
        if "---" in row[0]:
            ret_arr.append(temp)
            temp = []
        else:
            temp.append(row)
    return ret_arr


def return_GF_dict(data=None, ship_via=None):
    '''
    data (type: []): first two columns of the table func => get_only_line_items(GF_data())
    
    return (type: {}): 
    {
        "ship_via": Ship Via
        "po_no": 'Order No',
        "num_line_items": #,
        "line_items": [
            {"qty": #,
            "part_no": "str"}
        ], .....
    }
    '''
    data = get_only_line_items(data)
    line_items = []
    errors = []
    for row in data:
        try:
            qty = row[0][0].split()[1]
        except IndexError as e:
            errors.append({"error": "sig quantity not found", "type": "quantity", "item": row[0], "mssg": repr(e)})
        
        try:
            sig_prod = db_find_one(row[0][1].split()[0])["sig_prod"]
        except IndexError as e:
            errors.append({"error": "sig product ref. not found", "type": "product", "item": row[0][1].split()[0], "mssg": repr(e)})
            sig_prod = row[0][1].split()[0]
        except TypeError as e:
            errors.append({"error": "sig product ref. not found", "type": "product", "item": row[0][1].split()[0], "mssg": repr(e)})
            sig_prod = row[0][1].split()[0]
            
            
        line_items.append({
            "quantity": qty,
            "product": sig_prod
        })
        
    
    return {
        "num_line_items": len(line_items),
        "line_items": line_items,
        "errors": errors,
        "ship_via": ship_via
    }


def bunzul_industrial_extraction_algo(file):
    return return_GF_dict(GF_data(file), GENERAL_data(file, area=(226.0575, 124.69500000000001, 277.3125, 279.99))[-1])


print(bunzul_industrial_extraction_algo(rf"{sys.argv[1]}"))   
sys.stdout.flush()

# file = rf"C:\Users\0235124\OneDrive - Signode Industrial Group\Desktop\SIGNODE PROJECTS\SIGNODE PYTHON JUPYTER\GF PO\Examples\GF2.pdf"
# file = rf"Y:\Pick Ticket Project\EDI\Bunzl_industrial\PDFS_BUNZL_INDUSTRIAL\447767_000021_po41081615_11032021_000001.pdf"

# temp = bunzul_industrial_extraction_algo(file)
# print(temp)