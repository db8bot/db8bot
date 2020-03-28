import lib.scholarly as scholarly
# searchstr = input()
# print(searchstr)
# print(next(scholarly.search_pubs_query("https://heinonline.org/hol-cgi-bin/get_pdf.cgi?handle=hein.journals/hlr130&section=49")))
# print(next(scholarly.search_pubs_query(searchstr)))

print(next(scholarly.search_pubs_query('Perception of physical stability and center of mass of 3D objects')))