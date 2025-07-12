package main


import (
	"log"
	"net/http"
	"domofon/internal/config"
	serverhttp "domofon/server/http"
)


func main() {
	router := serverhttp.NewRouter()
	config.Init()
	config.SetupLogger()
	// Запуск сервера на порту 8080
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
