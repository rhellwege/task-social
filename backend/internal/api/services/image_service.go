package services

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"

	"github.com/rhellwege/task-social/config"
	"golang.org/x/image/draw" // for resizing
)

type ImageService struct {
	assetsDir string
}

var _ ImageServicer = (*ImageService)(nil)

func NewImageService(assetsDir string) *ImageService {
	// ensure the assets folder exists
	os.MkdirAll(assetsDir, os.ModePerm)
	return &ImageService{assetsDir: assetsDir}
}

func (s *ImageService) SaveProfileImage(ctx context.Context, userID string, fileBytes []byte) (string, error) {
	// decode image
	img, _, err := image.Decode(bytes.NewReader(fileBytes))
	if err != nil {
		return "", errors.New("invalid image format")
	}

	// resize/crop image size
	img = resizeImage(img, config.ProfileImageSize, config.ProfileImageSize)

	// generate SHA1 hash for filename
	hash := sha1.Sum(fileBytes)
	filename := hex.EncodeToString(hash[:]) + ".jpg"
	filepath := filepath.Join(s.assetsDir, filename)

	outFile, err := os.Create(filepath)
	if err != nil {
		return "", err
	}
	defer outFile.Close()

	if err := jpeg.Encode(outFile, img, &jpeg.Options{Quality: 90}); err != nil {
		return "", err
	}

	return "/assets/" + filename, nil
}

func resizeImage(img image.Image, width, height int) image.Image {
	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, img.Bounds(), draw.Over, nil)
	return dst
}
