# commision_calc
A simple NodeJS app for calculating commisions




mytestapp.js is the main app
calculations.js contains main calculation types
single_transaction.json file contains a few test data points to see if the program works
calculations.test.js contains testing for the calculations.js file

The program accepts a file with transactions, processes it and prints out resulting commisions for each transaction. The file must be in valid JSON format for the program to work and must be in the same directory as the mytestapp.js. 

To run the program:
1. open cmd in the same folder as the mytestapp.js file
2. type *node mytestapp.js [name_of_file_with_transactions]*

To run tests
1. open cmd in the same folder as the mytestapp.js file
1. type *npm test*
