package auth

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
)

// Интерфейс для отправки SMS — можно мокать или подставлять любую реализацию
type SMSSender interface {
	SendSMS(toPhone, message string) error
}

// Моковая версия — пишет в консоль
type MockSMSSender struct{}

func (s *MockSMSSender) SendSMS(toPhone, message string) error {
	fmt.Printf("[MOCK SMS] to: %s, msg: %s\n", toPhone, message)
	return nil
}

// Реальная версия (например, через sms.ru)
type RealSMSSender struct{}

func (s *RealSMSSender) SendSMS(toPhone, message string) error {
	apiKey := os.Getenv("SMSRU_API_KEY")
	smsAPI := os.Getenv("SMSRU_API_URL")
	if apiKey == "" || smsAPI == "" {
		return errors.New("sms config not set")
	}

	msg := url.QueryEscape(message)
	fullURL := fmt.Sprintf("%s?api_id=%s&to=%s&msg=%s", smsAPI, apiKey, toPhone, msg)

	resp, err := http.Get(fullURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Тут можешь добавить обработку статуса, если нужно
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("sms send failed with status: %s", resp.Status)
	}

	return nil
}
