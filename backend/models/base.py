from abc import ABC, abstractmethod
import numpy as np


class BaseSimulationModel(ABC):
    
    # abstract base class for all return path simulation models.

    @abstractmethod
    def generate_path(self, forecasted_days: int) -> np.ndarray:
        
        """
        generates daily return percentages for a single simulated path.

        Must return 2D np.ndarray of shape: (forecasted_days, num_assets)
        """
        pass 
    
    def generate_paths(
        self,
        num_simulations: int,
        forecasted_days: int,
    ) -> np.ndarray:
        """
        generates daily return percentages for a multiple simulated paths.
        
        Must return 3D np.ndarray of shape: (num_simulations, forecasted_days, num_assets)
        """
        pass