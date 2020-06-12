/* SCHEMA */
CREATE DATABASE IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8;
USE `mydb`;

/* users */
CREATE TABLE IF NOT EXISTS `users` (
  `ID` INT UNSIGNED AUTO_INCREMENT,
  `rank` INT(1) UNSIGNED NOT NULL,
  `email` VARCHAR(60) NOT NULL,
  `temporaryPassword` BOOLEAN DEFAULT TRUE,
  `password` VARCHAR(60) NOT NULL, -- SHA3-256 (?)
  `referalID` INT UNSIGNED,
  `phoneNumber` VARCHAR(15),
  `name` VARCHAR(255),
  `credits` FLOAT UNSIGNED DEFAULT 0,
  `registrationDate` DATETIME NOT NULL,
  `registrationIp` VARCHAR(45),
  `lastLoginDate` DATETIME NOT NULL,
  `lastLoginIp` VARCHAR(45),
  `secretQuestion` TEXT(255),
  `secretAnswer` VARCHAR(60),
  `activationServiceID` INT UNSIGNED,

  -- Index
  PRIMARY KEY (`ID`),
  UNIQUE (`email`)
);

/* transactions */
USE `mydb`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `ID` INT UNSIGNED AUTO_INCREMENT,
  `type` INT(1) UNSIGNED NOT NULL,
  `userID` INT UNSIGNED NOT NULL,

  -- Index
  PRIMARY KEY (`ID`),

  -- Foreign Keys
  CONSTRAINT `FK_transactions_users`
    FOREIGN KEY (`userID`)
    REFERENCES `users`(`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

/* orders */
USE `mydb`;
CREATE TABLE IF NOT EXISTS `orders` (
  `ID` INT UNSIGNED AUTO_INCREMENT,
  `transactionID` INT UNSIGNED,
  `status` INT(1) UNSIGNED NOT NULL,
  `order` TEXT(1000) NOT NULL,
  `comment` VARCHAR(255),
  `userID` INT UNSIGNED NOT NULL,

  -- Index
  PRIMARY KEY (`ID`),
  UNIQUE (`transactionID`),

  -- Foreign Keys
  CONSTRAINT `FK_orders_transactions`
    FOREIGN KEY (`transactionID`)
    REFERENCES `transactions`(`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_orders_users`
    FOREIGN KEY (`userID`)
    REFERENCES `users`(`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);