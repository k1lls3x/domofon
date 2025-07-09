package main


import (
	"log"
	"net/http"
	serverhttp "domofon/server/http"
)


func main() {
	router := serverhttp.NewRouter()
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
