-- Task 1
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email,
	account_password
	)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
	);

-- Task 2
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Task 3
DELETE from account
WHERE account_id = 1;

-- Task 4
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Task 5
SELECT inv.inv_make, inv.inv_model, cl.classification_name
FROM inventory AS inv
	INNER JOIN classification AS cl
		ON inv.classification_id = cl.classification_id
WHERE classification_name = 'Sport';

-- Task 6
UPDATE inventory
SET 
	inv_image = 
		CONCAT(
        SUBSTRING(inv_image FROM 1 FOR POSITION('/images/' IN inv_image) + LENGTH('/images/') - 1), 
        'vehicles/', 
        SUBSTRING(inv_image FROM POSITION('/images/' IN inv_image) + LENGTH('/images/'))
    ),
	inv_thumbnail =
		CONCAT(
        SUBSTRING(inv_thumbnail FROM 1 FOR POSITION('/images/' IN inv_thumbnail) + LENGTH('/images/') - 1), 
        'vehicles/', 
        SUBSTRING(inv_thumbnail FROM POSITION('/images/' IN inv_thumbnail) + LENGTH('/images/'))
    );
