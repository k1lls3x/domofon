package sms


import (
_	"errors"
_	"net/http"
	_"net/url"
_	"os"
	"fmt"
)

type RealSMSSender struct{}
type MockSMSSender struct{}
func (s *MockSMSSender) SendSMS(toPhone, message string) error {
	fmt.Printf("[MOCK SMS] to: %s, msg: %s\n", toPhone, message)
	// apiKey := os.Getenv("SMSRU_API_KEY")
	// smsAPI := os.Getenv("SMSRU_API_URL")
	// if apiKey == "" || smsAPI == "" {
	// 	return errors.New("sms config not set")
	// }
	// msg := url.QueryEscape(message)
	// fullURL := smsAPI + "?api_id=" + apiKey + "&to=" + toPhone + "&msg=" + msg
	// resp, err := http.Get(fullURL)
	// if err != nil {
	// 	return err
	// }
	// defer resp.Body.Close()
	return nil
}
