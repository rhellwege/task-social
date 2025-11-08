package services

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"time"

	"github.com/chai2010/webp"
	"github.com/rhellwege/task-social/config"
	"golang.org/x/image/draw"
)

type ImageServicer interface {
	SaveImage(ctx context.Context, fileBytes []byte, width, height int, subDir string) (string, error)
	SaveProfileImage(ctx context.Context, fileBytes []byte) (string, error)
	SaveBannerImage(ctx context.Context, fileBytes []byte) (string, error)
	DeleteImage(subDir, filename string) error
}

type ImageService struct {
	baseAssetsDir string
}

var _ ImageServicer = (*ImageService)(nil)

func NewImageService(baseAssetsDir string) *ImageService {
	os.MkdirAll(baseAssetsDir, os.ModePerm)
	return &ImageService{baseAssetsDir: baseAssetsDir}
}

func (s *ImageService) SaveImage(ctx context.Context, fileBytes []byte, width, height int, subDir string) (string, error) {
	var img image.Image
	var err error

	// Try to decode common formats
	img, _, err = image.Decode(bytes.NewReader(fileBytes))
	if err != nil {
		if webpImg, err2 := webp.Decode(bytes.NewReader(fileBytes)); err2 == nil {
			img = webpImg
		} else {
			return "", errors.New("invalid or unsupported image format")
		}
	}

	// Resize image
	img = resizeImage(img, width, height)

	// Ensure directory exists
	dirPath := filepath.Join(s.baseAssetsDir, subDir)
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return "", err
	}

	// Generate hashed filename
	hash := sha1.Sum(fileBytes)
	timestamp := time.Now().UnixNano()
	filename := fmt.Sprintf("%s_%d.webp", hex.EncodeToString(hash[:]), timestamp)
	filePath := filepath.Join(dirPath, filename)

	outFile, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer outFile.Close()

	// Encode as webp
	if err := webp.Encode(outFile, img, &webp.Options{Lossless: false, Quality: 90}); err != nil {
		return "", fmt.Errorf("failed to encode webp: %w", err)
	}

	return "/assets/" + subDir + "/" + filename, nil
}

func (s *ImageService) SaveProfileImage(ctx context.Context, fileBytes []byte) (string, error) {
	return s.SaveImage(ctx, fileBytes, config.ProfileImageSize, config.ProfileImageSize, config.ProfileImageSubDir)
}

func (s *ImageService) SaveBannerImage(ctx context.Context, fileBytes []byte) (string, error) {
	return s.SaveImage(ctx, fileBytes, config.BannerImageWidth, config.BannerImageHeight, config.BannerImageSubDir)
}

func resizeImage(img image.Image, width, height int) image.Image {
	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, img.Bounds(), draw.Over, nil)
	return dst
}

func (s *ImageService) DeleteImage(subDir, filename string) error {
	path := filepath.Join(s.baseAssetsDir, subDir, filename)
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil // file already gone
	}
	return os.Remove(path)
}
