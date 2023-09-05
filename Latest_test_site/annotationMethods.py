
import numpy as np

def createCircle(axes):

  theta = np.linspace(0, 2 * np.pi, 100)
  radius = 1

  a = radius * np.cos(theta)
  b = radius * np.sin(theta)

  axes.plot(a, b, color='k', linewidth=1)
  axes.set_aspect(1)

  axes.hlines(y=0, xmin=-1, xmax=1, linewidth=0.7, color='k')
  axes.vlines(x=0, ymin=-1, ymax=1, linewidth=0.7, color='k')

  axes.tick_params(axis='both', which='major', labelsize=10)
  axes.tick_params(axis='both', which='minor', labelsize=10)  

  landmarkEmotions = ['angry', 'afraid', 'sad', 'bored', 'excited',
                  'interested', 'happy', 'pleased', 'relaxed', 'content']
  landmarkValence = (-0.7, -0.65, -0.8, -0.1, 0.37,
              0.2, 0.5, 0.35, 0.6, 0.5)
  landmarkArousal = (0.65, 0.5, -0.15, -0.45, 0.9,
              0.7, 0.5, 0.35, -0.3, -0.45)

  for point in range(len(landmarkEmotions)):
      axes.scatter(landmarkValence, landmarkArousal, color='k', s=15)
      axes.text(landmarkValence[point] + 0.02, landmarkArousal[point] + 0.02,
          landmarkEmotions[point], fontsize='large')

  axes.xaxis.set_ticks(np.arange(-1, 1.25, 0.25))

  axes.yaxis.grid(color='grey', linestyle='dashed', linewidth=0.3)
  axes.xaxis.grid(color='grey', linestyle='dashed', linewidth=0.3)

 