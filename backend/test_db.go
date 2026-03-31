//go:build ignore

package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type BoardAccess struct {
	ID          uint
	BoardID     string
	TargetType  string
	TargetEmail string
	Permission  string
}

func main() {
	godotenv.Load()
	dsn := os.Getenv("DSN")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=reecho port=5432 sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	var accesses []BoardAccess
	db.Table("board_accesses").Find(&accesses)
	fmt.Printf("Board accesses count: %d\n", len(accesses))
	for _, a := range accesses {
		fmt.Printf("Access: %+v\n", a)
	}
}
