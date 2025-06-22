package main

import (
	"context"
	"fmt"
	"net/http"
	"rotaract-attendance/pkg/constants"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Attendance struct {
	PranaliID   string                `json:"pranaliId" bson:"pranaliId"`
	Name        string                `json:"name" bson:"name"`
	Designation constants.Designation `json:"designation" bson:"designation"`
	ClubName    string                `json:"clubName" bson:"clubName"`
	Event       string                `json:"event"`
	Time        int64                 `bson:"timestamp"`
}

var attendanceCollection *mongo.Collection

func main() {

	err := InitializeDbConnection()
	if err != nil {
		fmt.Print("Server crash. Failed to connect to the database: ", err.Error())
		return
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Correct origin
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("api/markAttendance", MarkAttendance)

	r.Run(":8080")
}

func InitializeDbConnection() error {
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI("mongodb+srv://ayushjain1141:ES7cSXJ7J6gXdPGd@cluster0.szyqg71.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").SetServerAPIOptions(serverAPI)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		return fmt.Errorf("Error in cache.InitializeCache while connecting to the mongodb database: " + err.Error())
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return fmt.Errorf("Error in cache.InitializeCache while pinging to the database: " + err.Error())
	}

	model := mongo.IndexModel{
		Keys: bson.D{
			{Key: "event", Value: 1},
			{Key: "pranaliId", Value: 1},
		},
		Options: options.Index().SetUnique(true).SetName("event_pranali_unique_idx"),
	}

	db := client.Database("rotaract")

	_, err = db.Collection("attendance").Indexes().CreateOne(ctx, model)
	if err != nil {
		return fmt.Errorf("error while creating a unique index: %s", err.Error())
	}

	fmt.Println("Connected to MongoDB!")
	attendanceCollection = db.Collection("attendance")
	return nil
}

func MarkAttendance(c *gin.Context) {
	var requestBody Attendance
	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON" + err.Error()})
		return
	}

	if requestBody.Event == "" || requestBody.PranaliID == "" {
		c.JSON(http.StatusOK, gin.H{
			"message": "Wrong QR.",
		})
		return
	}

	requestBody.Time = time.Now().Unix()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := attendanceCollection.InsertOne(ctx, requestBody)
	fmt.Println("err", err)

	if mongo.IsDuplicateKeyError(err) {
		c.JSON(http.StatusOK, gin.H{
			"message": "You have already registered",
		})
		return
	}

	if err != nil {
		fmt.Println("Error while inserting into collection: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Registration failed. Please try again.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Successfully registered. Welcome to Lead summit Rtr. " + requestBody.Name})
}
