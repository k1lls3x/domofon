package sms


import (
	"errors"
	"net/http"
	"net/url"
	"os"
)

type RealSMSSender struct{}

func (s *RealSMSSender) SendSMS(toPhone, message string) error {
	apiKey := os.Getenv("SMSRU_API_KEY")
	smsAPI := os.Getenv("SMSRU_API_URL")
	if apiKey == "" || smsAPI == "" {
		return errors.New("sms config not set")
	}
	msg := url.QueryEscape(message)
	fullURL := smsAPI + "?api_id=" + apiKey + "&to=" + toPhone + "&msg=" + msg
	resp, err := http.Get(fullURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}
