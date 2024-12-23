use dreamHome


create table Lease(
leaseNo int primary key,
propertyNo varchar(100) foreign key REFERENCES propertyForRent(propertyNo),
clientNo varchar(100) foreign key REFERENCES client(clientNo),
rent int,
paymentMethod varchar(30),
deposit int,
paid varchar(10),
rentStart varchar(30),
rentFinish varchar(30),
duration int,
)

 insert into Lease(leaseNo, clientNo ,propertyNo,rent,paymentMethod,deposit,paid,rentStart,rentFinish,duration)
 values ( 10024,'CR62','PA14',650,'Visa',1300,'Y','1-June-13','31-May-14',12),
 ( 10075,'CR76','PL94',400,'Cash',800,'N','1-Aug-13','31-Jan-14',6),
 ( 10012,'CR74','PG21',600,'Cheque',1200,'Y','1-July-13','30-June-14',12)

 select * from staff
select * from viewing
select * from registration
select * from privateOwner
select * from propertyForRent
select * from Branch
select * from Client
select * from Lease

--1.Detail of Properties which are not registered in any branch.
select * from propertyForRent where branchNo is Null

--2. Detail of staff members who did not registered a single client yet. 
select * from staff left join registration on staff.staffNo = registration.staffNo where  registration.staffNo is null

--3. Detail of branches where more than two staff members are working. 
SELECT b.*, COUNT(s.staffNo) as StaffCount FROM branch b JOIN staff s ON b.branchNo = s.branchNo
GROUP BY b.branchNo, b.street, b.city, b.postCode
HAVING COUNT(s.staffNo) > 2

--4. Detail of properties which are viewed more than once and got some comments from clients. 
select p.* , COUNT(v.propertyNO) As Viewed_Number from propertyForRent p join viewing v on 
p.propertyNo = v.propertyNO where v.comment is not Null group by p.propertyNo, p.street, p.city, p.postCode, p.type, p.rooms, p.rent, p.ownerNo, p.staffNo, p.branchNo HAVING COUNT(v.propertyNO) > 1

--5. Detail of properties whose rent is in range of 400 to 500 and they are flat and belongs to other than London city and no staff member is handling these properties. 
select *  from propertyForRent p where (p.rent between 400 and 500) and (p.type = 'Flat') and (p.city != 'London') and 
(p.staffNo is Null)

--6. Add 15% of the salary to the salary of the eldest member of staff
update staff set salary = (salary * 1.15) where DOB = (select MIN(DOB) from staff)

select * from staff

--7. Detail of staff members whose gender is male and their date of birth is in second half of the year. 
select * from staff where sex = 'M' and (MONTH(DOB) > 6 )

--8. Detail of leased properties with How many times these have been leased and display in ascending order by how many times these have been leased.
select p.*,COUNT(L.propertyNo) as Lease_Count_Number  from propertyForRent p left join Lease L on 
p.propertyNo = L.propertyNo group by p.propertyNo, p.branchNo, p.ownerNo,p.staffNo, p.city, p.street, p.postCode, p.rent, p.rooms, p.type
order by COUNT(L.propertyNo) asc
