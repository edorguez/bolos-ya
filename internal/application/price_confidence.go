package application

import (
	"sort"

	"github.com/google/uuid"
	
	"github.com/edorguez/bolos-ya/internal/domain"
)

// PriceConfidenceService calculates confidence scores for price reports
type PriceConfidenceService struct {
	priceRepo domain.PriceRepository
}

// NewPriceConfidenceService creates a new PriceConfidenceService
func NewPriceConfidenceService(priceRepo domain.PriceRepository) *PriceConfidenceService {
	return &PriceConfidenceService{
		priceRepo: priceRepo,
	}
}

// PriceCluster represents a cluster of similar prices
type PriceCluster struct {
	AveragePriceBs float64
	AveragePriceUsd float64
	Count          int
	Prices         []*domain.Price
}

// CalculatePriceConfidence calculates the confidence score for a product at a supermarket
// based on recent price reports. Returns a score between 0.0 and 1.0.
func (s *PriceConfidenceService) CalculatePriceConfidence(productID, supermarketID uuid.UUID) (float64, error) {
	// Get recent price reports (last 7 days)
	prices, err := s.priceRepo.FindRecentPrices(nil, productID, supermarketID, 7)
	if err != nil {
		return 0.5, err // Default medium confidence on error
	}

	if len(prices) < 3 {
		return 0.5, nil // Not enough data
	}

	// Cluster prices by similarity (10% tolerance)
	clusters := s.clusterPrices(prices, 0.10)

	// Find the largest cluster
	largestCluster := s.findLargestCluster(clusters)

	// Calculate confidence based on cluster size
	confidence := float64(largestCluster.Count) / float64(len(prices))

	// Boost confidence for well-established clusters
	if largestCluster.Count > 10 && confidence > 0.8 {
		return 0.95, nil
	}

	return confidence, nil
}

// clusterPrices groups similar prices together within the given tolerance
func (s *PriceConfidenceService) clusterPrices(prices []*domain.Price, tolerance float64) []PriceCluster {
	if len(prices) == 0 {
		return nil
	}

	// Sort by price in bolivares for consistent clustering
	sort.Slice(prices, func(i, j int) bool {
		return prices[i].PriceBolivares < prices[j].PriceBolivares
	})

	var clusters []PriceCluster

	for _, price := range prices {
		placed := false

		// Try to place in existing cluster
		for i := range clusters {
			clusterAvg := clusters[i].AveragePriceBs
			currentPrice := float64(price.PriceBolivares) / 100.0 // Convert cents to currency units

			// Check if price is within tolerance of cluster average
			if abs(currentPrice-clusterAvg)/clusterAvg <= tolerance {
				// Add to cluster
				clusters[i].Count++
				clusters[i].Prices = append(clusters[i].Prices, price)
				// Update average
				total := clusterAvg*float64(clusters[i].Count-1) + currentPrice
				clusters[i].AveragePriceBs = total / float64(clusters[i].Count)
				
				// Also update USD average if available
				if price.PriceUSD > 0 {
					usdPrice := float64(price.PriceUSD) / 100.0
					if clusters[i].AveragePriceUsd == 0 {
						clusters[i].AveragePriceUsd = usdPrice
					} else {
						totalUsd := clusters[i].AveragePriceUsd*float64(clusters[i].Count-1) + usdPrice
						clusters[i].AveragePriceUsd = totalUsd / float64(clusters[i].Count)
					}
				}
				
				placed = true
				break
			}
		}

		// If not placed, create new cluster
		if !placed {
			clusters = append(clusters, PriceCluster{
				AveragePriceBs:  float64(price.PriceBolivares) / 100.0,
				AveragePriceUsd: float64(price.PriceUSD) / 100.0,
				Count:           1,
				Prices:          []*domain.Price{price},
			})
		}
	}

	return clusters
}

// findLargestCluster returns the cluster with the most prices
func (s *PriceConfidenceService) findLargestCluster(clusters []PriceCluster) PriceCluster {
	if len(clusters) == 0 {
		return PriceCluster{}
	}

	largest := clusters[0]
	for _, cluster := range clusters[1:] {
		if cluster.Count > largest.Count {
			largest = cluster
		}
	}

	return largest
}

// UpdatePriceConfidence updates the confidence score for a specific price report
func (s *PriceConfidenceService) UpdatePriceConfidence(price *domain.Price) error {
	confidence, err := s.CalculatePriceConfidence(price.ProductID, price.SupermarketID)
	if err != nil {
		return err
	}

	price.ConfidenceScore = confidence
	// Note: This method doesn't save the price, the caller should update it
	return nil
}

// UpdateAllConfidenceScores recalculates confidence for all prices of a product at a supermarket
func (s *PriceConfidenceService) UpdateAllConfidenceScores(productID, supermarketID uuid.UUID) error {
	prices, err := s.priceRepo.FindByProductAndSupermarket(nil, productID, supermarketID)
	if err != nil {
		return err
	}

	confidence, err := s.CalculatePriceConfidence(productID, supermarketID)
	if err != nil {
		return err
	}

	// Update all prices with the new confidence score
	for _, price := range prices {
		price.ConfidenceScore = confidence
		if err := s.priceRepo.Update(nil, price); err != nil {
			// Log error but continue with others
			continue
		}
	}

	return nil
}

// abs returns the absolute value of a float64
func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
